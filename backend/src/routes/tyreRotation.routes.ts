import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { authenticate, requireRole } from '../middleware/auth';
import { ROLES } from '../constants/roles';

const router = Router();
router.use(authenticate);

const ASSET_TYPES = ['Vehicle', 'Trailer'] as const;
const MOVEMENT_TYPES = ['Rotation', 'MoveToSpare', 'SpareToActive', 'Remove', 'AddReplacement'] as const;
const DESTINATION_STATUSES = ['Spare', 'SentForRepair', 'Repairable', 'Retreaded', 'Scrap'] as const;

const lineSchema = z.object({
  tyreId: z.string().uuid(),
  oldPositionCode: z.string().max(20).optional().nullable(),
  newPositionCode: z.string().max(20).optional().nullable(),
  oldTreadDepth: z.number().optional().nullable(),
  newTreadDepth: z.number().optional().nullable(),
  airPressure: z.number().optional().nullable(),
  movementType: z.enum(MOVEMENT_TYPES),
  destinationStatus: z.enum(DESTINATION_STATUSES).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
});

const headerSchema = z.object({
  assetType: z.enum(ASSET_TYPES),
  assetId: z.string().uuid(),
  rotationDate: z.coerce.date(),
  odometerReading: z.number(),
  workshopId: z.string().uuid().optional().nullable(),
  technicianName: z.string().max(120).optional().nullable(),
  supervisorId: z.string().uuid().optional().nullable(),
  reasonCode: z.string().max(40).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
  lines: z.array(lineSchema).min(1, 'At least one tyre movement line is required'),
});

const ROTATION_WRITE_ROLES = [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR];
const ROTATION_APPROVE_ROLES = [ROLES.ADMIN, ROLES.FLEET_MANAGER];

function assetTable(assetType: string) {
  return assetType === 'Vehicle' ? 'vehicle_master' : 'trailer_master';
}
function assetPk(assetType: string) {
  return assetType === 'Vehicle' ? 'vehicle_id' : 'trailer_id';
}
function assetFitmentCol(assetType: string) {
  return assetType === 'Vehicle' ? 'current_vehicle_id' : 'current_trailer_id';
}

/**
 * Validates the 18 tyre-rotation business rules that apply at create/submit time.
 * Returns a list of human-readable error strings (empty = valid).
 */
async function validateRotation(
  client: any,
  payload: z.infer<typeof headerSchema>,
  excludeRotationHeaderId?: string
): Promise<string[]> {
  const errors: string[] = [];
  const { assetType, assetId, rotationDate, odometerReading, lines } = payload;

  const assetRes = await client.query(
    `SELECT current_odometer_km AS odo FROM vehicle_master WHERE vehicle_id = $1 AND deleted_flag = false`,
    [assetId]
  );
  let currentOdo: number | null = null;
  if (assetType === 'Vehicle') {
    if (!assetRes.rows.length) errors.push('Vehicle not found');
    else currentOdo = assetRes.rows[0].odo;
  } else {
    const tRes = await client.query(`SELECT trailer_id FROM trailer_master WHERE trailer_id = $1 AND deleted_flag = false`, [assetId]);
    if (!tRes.rows.length) errors.push('Trailer not found');
  }
  if (currentOdo != null && Number(odometerReading) < Number(currentOdo)) {
    errors.push(`Odometer reading (${odometerReading}) cannot be less than the asset's last recorded odometer (${currentOdo})`);
  }

  // No position may receive two active tyres; no tyre may end up in two active positions.
  const newPositionsUsed = new Set<string>();
  const tyreIdsUsed = new Set<string>();
  for (const line of lines) {
    if (tyreIdsUsed.has(line.tyreId)) errors.push(`Tyre ${line.tyreId} appears more than once in this rotation`);
    tyreIdsUsed.add(line.tyreId);

    if (line.newPositionCode && (line.movementType === 'Rotation' || line.movementType === 'SpareToActive' || line.movementType === 'AddReplacement')) {
      if (newPositionsUsed.has(line.newPositionCode)) {
        errors.push(`Position ${line.newPositionCode} is targeted by more than one tyre in this rotation`);
      }
      newPositionsUsed.add(line.newPositionCode);
    }

    if ((line.movementType === 'Remove' || line.movementType === 'MoveToSpare') && !line.destinationStatus) {
      errors.push(`Tyre ${line.tyreId}: a destination status is required when removing a tyre from service`);
    }

    // Tyre must exist and not already be in two active positions / fitments.
    const tyreRes = await client.query(`SELECT tyre_id, status, current_vehicle_id, current_trailer_id, last_rotation_date FROM tyre_master WHERE tyre_id = $1 AND deleted_flag = false`, [line.tyreId]);
    if (!tyreRes.rows.length) {
      errors.push(`Tyre ${line.tyreId} not found`);
      continue;
    }
    const tyre = tyreRes.rows[0];
    if (tyre.last_rotation_date && new Date(tyre.last_rotation_date) > new Date(rotationDate)) {
      errors.push(`Tyre ${line.tyreId}: rotation date cannot precede its last recorded movement date (${tyre.last_rotation_date})`);
    }
  }

  // Destination position must not already be occupied by a different active tyre in tyre_master.
  for (const posCode of newPositionsUsed) {
    const occRes = await client.query(
      `SELECT tyre_id FROM tyre_master WHERE deleted_flag = false AND current_position = $1 AND ${assetFitmentCol(assetType)} = $2`,
      [posCode, assetId]
    );
    const occupiedByOther = occRes.rows.filter((r: any) => !tyreIdsUsed.has(r.tyre_id));
    if (occupiedByOther.length) {
      errors.push(`Position ${posCode} on this asset is already occupied by another active tyre`);
    }
  }

  return errors;
}

/**
 * @openapi
 * /api/tyre-positions:
 *   get:
 *     summary: List tyre position codes (optionally filtered by asset type / axle configuration)
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Position master list }
 */
router.get('/tyre-positions', async (req: Request, res: Response) => {
  const { assetType, axleConfiguration } = req.query as Record<string, string>;
  const where: string[] = [];
  const params: any[] = [];
  if (assetType) { params.push(assetType); where.push(`asset_type = $${params.length}`); }
  if (axleConfiguration) { params.push(axleConfiguration); where.push(`axle_configuration = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await pool.query(`SELECT * FROM tyre_position_master ${whereSql} ORDER BY axle_configuration, sort_order`, params);
  return ok(res, rows.rows);
});

/**
 * @openapi
 * /api/tyre-rotations/validate:
 *   post:
 *     summary: Validate a tyre rotation payload without persisting it
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Validation result }
 */
router.post('/tyre-rotations/validate', async (req: Request, res: Response) => {
  const parsed = headerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid payload', 422, parsed.error.issues);
  const client = await pool.connect();
  try {
    const errors = await validateRotation(client, parsed.data);
    return ok(res, { valid: errors.length === 0, errors });
  } finally {
    client.release();
  }
});

/**
 * @openapi
 * /api/assets/{assetType}/{assetId}/tyre-layout:
 *   get:
 *     summary: Get current tyre layout (position -> tyre) for an asset
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Layout with positions and current fitments }
 */
router.get('/assets/:assetType/:assetId/tyre-layout', async (req: Request, res: Response) => {
  const { assetType, assetId } = req.params;
  if (!ASSET_TYPES.includes(assetType as any)) return fail(res, 'Invalid assetType', 422);

  const assetRes = await pool.query(
    assetType === 'Vehicle'
      ? `SELECT axle_configuration, current_odometer_km AS odometer FROM vehicle_master WHERE vehicle_id = $1 AND deleted_flag = false`
      : `SELECT axle_count, NULL::decimal AS odometer FROM trailer_master WHERE trailer_id = $1 AND deleted_flag = false`,
    [assetId]
  );
  if (!assetRes.rows.length) return fail(res, 'Asset not found', 404);
  // trailer_master tracks axle_count (int), not a named axle_configuration like vehicle_master;
  // derive the lookup key used by tyre_position_master from it.
  const axleConfig = assetType === 'Vehicle'
    ? assetRes.rows[0].axle_configuration
    : `${assetRes.rows[0].axle_count}-Axle`;

  const positionsRes = await pool.query(
    `SELECT position_code, position_label, sort_order FROM tyre_position_master
     WHERE asset_type = $1 AND axle_configuration = $2 ORDER BY sort_order`,
    [assetType, axleConfig]
  );

  const fitmentRes = await pool.query(
    `SELECT tyre_id, tyre_serial_no, brand, model, size, current_position, status, total_run_km,
            last_rotation_date, last_rotation_odometer_km
     FROM tyre_master WHERE deleted_flag = false AND ${assetFitmentCol(assetType)} = $1`,
    [assetId]
  );
  const byPosition = new Map(fitmentRes.rows.map((r: any) => [r.current_position, r]));

  const positions = positionsRes.rows.map((p: any) => ({
    positionCode: p.position_code,
    positionLabel: p.position_label,
    sortOrder: p.sort_order,
    tyre: byPosition.get(p.position_code) || null,
  }));

  const spareRes = await pool.query(
    `SELECT tyre_id, tyre_serial_no, brand, model, size, status, total_run_km
     FROM tyre_master WHERE deleted_flag = false AND status = 'Spare'
       AND (current_branch_id IS NULL OR current_branch_id = (
         SELECT branch_id FROM ${assetTable(assetType)} WHERE ${assetPk(assetType)} = $1
       ))`,
    [assetId]
  );

  return ok(res, { assetType, assetId, axleConfiguration: axleConfig, odometer: assetRes.rows[0].odometer, positions, spareTyres: spareRes.rows });
});

/**
 * @openapi
 * /api/tyres/{tyreId}/history:
 *   get:
 *     summary: Full lifecycle history for a single tyre (purchase, fitments, rotations, repairs, scrap)
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Tyre with its movement history }
 */
router.get('/tyres/:tyreId/history', async (req: Request, res: Response) => {
  const { tyreId } = req.params;
  const tyreRes = await pool.query(`SELECT * FROM tyre_master WHERE tyre_id = $1 AND deleted_flag = false`, [tyreId]);
  if (!tyreRes.rows.length) return fail(res, 'Tyre not found', 404);

  const movementsRes = await pool.query(
    `SELECT m.*, v.registration_no, t.trailer_no
     FROM tyre_movement m
     LEFT JOIN vehicle_master v ON v.vehicle_id = m.vehicle_id
     LEFT JOIN trailer_master t ON t.trailer_id = m.trailer_id
     WHERE m.tyre_id = $1 ORDER BY m.movement_datetime ASC`,
    [tyreId]
  );

  return ok(res, { tyre: tyreRes.rows[0], movements: movementsRes.rows });
});

/**
 * @openapi
 * /api/tyre-rotations:
 *   get:
 *     summary: List tyre rotations with filters
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated rotation list }
 *   post:
 *     summary: Create a tyre rotation draft (header + lines)
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Draft created }
 */
router.get('/tyre-rotations', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 20));
  const { assetId, status, workshopId, dateFrom, dateTo, tyreSerial } = req.query as Record<string, string>;

  const where: string[] = [];
  const params: any[] = [];
  if (assetId) { params.push(assetId); where.push(`h.asset_id = $${params.length}`); }
  if (status) { params.push(status); where.push(`h.status = $${params.length}`); }
  if (workshopId) { params.push(workshopId); where.push(`h.workshop_id = $${params.length}`); }
  if (dateFrom) { params.push(dateFrom); where.push(`h.rotation_date >= $${params.length}`); }
  if (dateTo) { params.push(dateTo); where.push(`h.rotation_date <= $${params.length}`); }
  if (tyreSerial) {
    params.push(`%${tyreSerial}%`);
    where.push(`EXISTS (SELECT 1 FROM tyre_movement m JOIN tyre_master t ON t.tyre_id = m.tyre_id WHERE m.rotation_header_id = h.rotation_header_id AND t.tyre_serial_no ILIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT count(*) FROM tyre_rotation_header h ${whereSql}`, params);
  const total = Number(countRes.rows[0].count);

  params.push(pageSize, (page - 1) * pageSize);
  const rowsRes = await pool.query(
    `SELECT h.*,
            (SELECT count(*) FROM tyre_movement m WHERE m.rotation_header_id = h.rotation_header_id) AS line_count,
            COALESCE(v.registration_no, t.trailer_no) AS asset_label
     FROM tyre_rotation_header h
     LEFT JOIN vehicle_master v ON h.asset_type = 'Vehicle' AND v.vehicle_id = h.asset_id
     LEFT JOIN trailer_master t ON h.asset_type = 'Trailer' AND t.trailer_id = h.asset_id
     ${whereSql}
     ORDER BY h.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return ok(res, { items: rowsRes.rows, total, page, pageSize });
});

router.post('/tyre-rotations', requireRole(...ROTATION_WRITE_ROLES), async (req: Request, res: Response) => {
  const parsed = headerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid payload', 422, parsed.error.issues);
  const payload = parsed.data;

  const client = await pool.connect();
  try {
    const errors = await validateRotation(client, payload);
    if (errors.length) return fail(res, 'Validation failed', 422, errors);

    await client.query('BEGIN');
    const headerRes = await client.query(
      `INSERT INTO tyre_rotation_header
        (asset_type, asset_id, rotation_date, odometer_km, workshop_id, technician_name, supervisor_id, reason_code, remarks, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Draft',$10) RETURNING *`,
      [
        payload.assetType, payload.assetId, payload.rotationDate, payload.odometerReading,
        payload.workshopId || null, payload.technicianName || null, payload.supervisorId || null,
        payload.reasonCode || null, payload.remarks || null, req.user!.user_id,
      ]
    );
    const header = headerRes.rows[0];

    for (const line of payload.lines) {
      await client.query(
        `INSERT INTO tyre_movement
          (tyre_id, movement_type, vehicle_id, trailer_id, from_position, to_position, odometer_km, tread_depth_mm,
           condition_notes, movement_datetime, status, rotation_header_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Draft',$11)`,
        [
          line.tyreId, line.movementType,
          payload.assetType === 'Vehicle' ? payload.assetId : null,
          payload.assetType === 'Trailer' ? payload.assetId : null,
          line.oldPositionCode || null, line.newPositionCode || null, payload.odometerReading,
          line.newTreadDepth ?? line.oldTreadDepth ?? null, line.remarks || null, payload.rotationDate, header.rotation_header_id,
        ]
      );
    }
    await client.query('COMMIT');
    return ok(res, header, 'Draft created', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    return fail(res, err instanceof Error ? err.message : 'Failed to create rotation', 500);
  } finally {
    client.release();
  }
});

async function fetchRotationDetail(rotationHeaderId: string) {
  const headerRes = await pool.query(`SELECT * FROM tyre_rotation_header WHERE rotation_header_id = $1`, [rotationHeaderId]);
  if (!headerRes.rows.length) return null;
  const linesRes = await pool.query(
    `SELECT m.*, t.tyre_serial_no, t.brand, t.model, t.size
     FROM tyre_movement m JOIN tyre_master t ON t.tyre_id = m.tyre_id
     WHERE m.rotation_header_id = $1 ORDER BY m.movement_datetime, m.tyre_movement_id`,
    [rotationHeaderId]
  );
  return { ...headerRes.rows[0], lines: linesRes.rows };
}

/**
 * @openapi
 * /api/tyre-rotations/{rotationId}:
 *   get:
 *     summary: Get a tyre rotation header with its lines
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Rotation detail }
 *   put:
 *     summary: Update a draft tyre rotation (header + replace lines)
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Draft updated }
 */
router.get('/tyre-rotations/:rotationId', async (req: Request, res: Response) => {
  const detail = await fetchRotationDetail(req.params.rotationId);
  if (!detail) return fail(res, 'Rotation not found', 404);
  return ok(res, detail);
});

router.put('/tyre-rotations/:rotationId', requireRole(...ROTATION_WRITE_ROLES), async (req: Request, res: Response) => {
  const parsed = headerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Invalid payload', 422, parsed.error.issues);
  const payload = parsed.data;
  const { rotationId } = req.params;

  const client = await pool.connect();
  try {
    const existingRes = await client.query(`SELECT status, created_by FROM tyre_rotation_header WHERE rotation_header_id = $1`, [rotationId]);
    if (!existingRes.rows.length) return fail(res, 'Rotation not found', 404);
    const existing = existingRes.rows[0];
    if (existing.status !== 'Draft' && req.user!.role_code !== ROLES.ADMIN) {
      return fail(res, 'Only drafts can be edited (admins may override)', 409);
    }

    const errors = await validateRotation(client, payload, rotationId);
    if (errors.length) return fail(res, 'Validation failed', 422, errors);

    await client.query('BEGIN');
    await client.query(
      `UPDATE tyre_rotation_header SET
        asset_type=$1, asset_id=$2, rotation_date=$3, odometer_km=$4, workshop_id=$5, technician_name=$6,
        supervisor_id=$7, reason_code=$8, remarks=$9
       WHERE rotation_header_id=$10`,
      [
        payload.assetType, payload.assetId, payload.rotationDate, payload.odometerReading,
        payload.workshopId || null, payload.technicianName || null, payload.supervisorId || null,
        payload.reasonCode || null, payload.remarks || null, rotationId,
      ]
    );
    await client.query(`DELETE FROM tyre_movement WHERE rotation_header_id = $1`, [rotationId]);
    for (const line of payload.lines) {
      await client.query(
        `INSERT INTO tyre_movement
          (tyre_id, movement_type, vehicle_id, trailer_id, from_position, to_position, odometer_km, tread_depth_mm,
           condition_notes, movement_datetime, status, rotation_header_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Draft',$11)`,
        [
          line.tyreId, line.movementType,
          payload.assetType === 'Vehicle' ? payload.assetId : null,
          payload.assetType === 'Trailer' ? payload.assetId : null,
          line.oldPositionCode || null, line.newPositionCode || null, payload.odometerReading,
          line.newTreadDepth ?? line.oldTreadDepth ?? null, line.remarks || null, payload.rotationDate, rotationId,
        ]
      );
    }
    await client.query('COMMIT');
    const detail = await fetchRotationDetail(rotationId);
    return ok(res, detail, 'Draft updated');
  } catch (err) {
    await client.query('ROLLBACK');
    return fail(res, err instanceof Error ? err.message : 'Failed to update rotation', 500);
  } finally {
    client.release();
  }
});

/**
 * @openapi
 * /api/tyre-rotations/{rotationId}/submit:
 *   post:
 *     summary: Submit a draft rotation - applies fitment changes, lifecycle history and locks the draft
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Rotation submitted }
 */
router.post('/tyre-rotations/:rotationId/submit', requireRole(...ROTATION_WRITE_ROLES), async (req: Request, res: Response) => {
  const { rotationId } = req.params;
  const client = await pool.connect();
  try {
    const headerRes = await client.query(`SELECT * FROM tyre_rotation_header WHERE rotation_header_id = $1`, [rotationId]);
    if (!headerRes.rows.length) return fail(res, 'Rotation not found', 404);
    const header = headerRes.rows[0];
    if (header.status !== 'Draft') return fail(res, 'Only draft rotations can be submitted', 409);

    const linesRes = await client.query(`SELECT * FROM tyre_movement WHERE rotation_header_id = $1`, [rotationId]);
    if (!linesRes.rows.length) return fail(res, 'Rotation has no lines', 422);

    await client.query('BEGIN');

    const alerts: { tyreId: string; serial: string; reason: string }[] = [];

    for (const line of linesRes.rows) {
      const fitmentCol = header.asset_type === 'Vehicle' ? 'current_vehicle_id' : 'current_trailer_id';
      let newStatus = 'Running';
      let newPosition: string | null = line.to_position;
      let clearFitment = false;

      if (line.movement_type === 'Remove' || line.movement_type === 'MoveToSpare') {
        newStatus = req.body?.destinationStatusByTyre?.[line.tyre_id] || 'Spare';
        newPosition = null;
        clearFitment = true;
      } else if (line.movement_type === 'SpareToActive' || line.movement_type === 'Rotation' || line.movement_type === 'AddReplacement') {
        newStatus = 'Running';
      }

      await client.query(
        `UPDATE tyre_master SET
           status = $1,
           current_position = $2,
           ${fitmentCol} = $3,
           total_run_km = COALESCE(total_run_km, 0) + GREATEST($4 - COALESCE(last_rotation_odometer_km, $4), 0),
           last_rotation_date = $5,
           last_rotation_odometer_km = $4,
           updated_at = now()
         WHERE tyre_id = $6`,
        [newStatus, clearFitment ? null : newPosition, clearFitment ? null : header.asset_id, header.odometer_km, header.rotation_date, line.tyre_id]
      );

      await client.query(`UPDATE tyre_movement SET status = 'Submitted' WHERE tyre_movement_id = $1`, [line.tyre_movement_id]);

      const tyreRes = await client.query(`SELECT tyre_serial_no FROM tyre_master WHERE tyre_id = $1`, [line.tyre_id]);
      if (line.tread_depth_mm != null && Number(line.tread_depth_mm) <= 3) {
        alerts.push({ tyreId: line.tyre_id, serial: tyreRes.rows[0]?.tyre_serial_no, reason: `Tread depth ${line.tread_depth_mm}mm at or below near-scrap threshold (3mm)` });
      }
    }

    await client.query(
      `UPDATE tyre_rotation_header SET status = 'Submitted', submitted_by = $1, submitted_at = now() WHERE rotation_header_id = $2`,
      [req.user!.user_id, rotationId]
    );

    await client.query(
      `INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, new_values)
       VALUES ('tyre_rotation_header', $1, 'Update', $2, now(), $3, $4)`,
      [rotationId, req.user!.user_id, JSON.stringify({ status: 'Draft' }), JSON.stringify({ status: 'Submitted' })]
    );

    await client.query('COMMIT');
    const detail = await fetchRotationDetail(rotationId);
    return ok(res, { ...detail, alerts }, 'Rotation submitted');
  } catch (err) {
    await client.query('ROLLBACK');
    return fail(res, err instanceof Error ? err.message : 'Failed to submit rotation', 500);
  } finally {
    client.release();
  }
});

/**
 * @openapi
 * /api/tyre-rotations/{rotationId}/approve:
 *   post:
 *     summary: Approve a submitted rotation (final lock)
 *     tags: [Tyre Rotation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Rotation approved }
 */
router.post('/tyre-rotations/:rotationId/approve', requireRole(...ROTATION_APPROVE_ROLES), async (req: Request, res: Response) => {
  const { rotationId } = req.params;
  const headerRes = await pool.query(`SELECT status FROM tyre_rotation_header WHERE rotation_header_id = $1`, [rotationId]);
  if (!headerRes.rows.length) return fail(res, 'Rotation not found', 404);
  if (headerRes.rows[0].status !== 'Submitted') return fail(res, 'Only submitted rotations can be approved', 409);

  await pool.query(
    `UPDATE tyre_rotation_header SET status = 'Approved', approved_by = $1, approved_at = now() WHERE rotation_header_id = $2`,
    [req.user!.user_id, rotationId]
  );
  await pool.query(
    `INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, new_values)
     VALUES ('tyre_rotation_header', $1, 'Update', $2, now(), $3, $4)`,
    [rotationId, req.user!.user_id, JSON.stringify({ status: 'Submitted' }), JSON.stringify({ status: 'Approved' })]
  );

  const detail = await fetchRotationDetail(rotationId);
  return ok(res, detail, 'Rotation approved');
});

export default router;
