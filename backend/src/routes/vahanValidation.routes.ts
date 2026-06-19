import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { authenticate, requireRole } from '../middleware/auth';
import { ROLES } from '../constants/roles';
import { callVahanApi } from '../services/vahanClient';

const router = Router();
router.use(authenticate);

const COMPLIANCE_WARNING_DAYS = 30;

const validateSchema = z.object({
  vehicleIds: z.array(z.string().uuid()).min(1, 'At least one vehicle must be selected'),
});

interface VehicleResultDto {
  vehicle_id: string;
  vehicle_no: string;
  response_status: string;
  message?: string;
  rc_status?: string | null;
  fitness_valid_upto?: string | null;
  pucc_valid_upto?: string | null;
  insurance_valid_upto?: string | null;
  permit_valid_upto?: string | null;
  road_tax_paid_upto?: string | null;
  is_blacklisted?: boolean;
  blacklist_reason?: string | null;
  gross_vehicle_weight_kg?: number | null;
  result_id?: string;
}

async function upsertComplianceAlert(
  client: any,
  vehicleId: string,
  complianceTypeCode: string,
  validUpto: string,
  userId: string | null
) {
  // Mirror the asset_compliance convention used across the codebase (polymorphic
  // asset_type/asset_id, status derived from validity window) so the existing
  // alertsEngine compliance-expiry rule picks these up automatically.
  const today = new Date();
  const expiry = new Date(validUpto);
  const isExpired = expiry < today;
  const status = isExpired ? 'Expired' : 'ExpiringSoon';

  const existing = await client.query(
    `SELECT asset_compliance_id FROM asset_compliance
     WHERE asset_type = 'Vehicle' AND asset_id = $1 AND compliance_type_code = $2 AND deleted_flag = false
     ORDER BY created_at DESC LIMIT 1`,
    [vehicleId, complianceTypeCode]
  );

  if (existing.rows.length) {
    await client.query(
      `UPDATE asset_compliance
       SET valid_upto = $1, status = $2, last_verified_source = 'VAHAN', verified_at = now(), updated_by = $3, updated_at = now()
       WHERE asset_compliance_id = $4`,
      [validUpto, status, userId, existing.rows[0].asset_compliance_id]
    );
  } else {
    await client.query(
      `INSERT INTO asset_compliance
        (asset_type, asset_id, compliance_type_code, valid_upto, status, last_verified_source, verified_at, created_by, updated_by)
       VALUES ('Vehicle', $1, $2, $3, $4, 'VAHAN', now(), $5, $5)`,
      [vehicleId, complianceTypeCode, validUpto, status, userId]
    );
  }
}

/**
 * @openapi
 * /api/vahan-validation/validate:
 *   post:
 *     summary: Validate a batch of vehicles against the (mock) VAHAN/ULIP vehicle data API and persist results
 *     tags: [Compliance]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Per-vehicle validation results and summary }
 */
router.post('/validate', requireRole(ROLES.ADMIN, ROLES.FLEET_MANAGER), async (req: Request, res: Response) => {
  const parsed = validateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Validation failed', 422, parsed.error.issues);

  const { vehicleIds } = parsed.data;
  const userId = req.user?.user_id || null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: vehicles } = await client.query(
      `SELECT vehicle_id, registration_no FROM vehicle_master WHERE vehicle_id = ANY($1::uuid[]) AND deleted_flag = false`,
      [vehicleIds]
    );
    const vehicleById = new Map<string, { vehicle_id: string; registration_no: string }>(
      vehicles.map((v: any) => [v.vehicle_id, v])
    );

    const results: VehicleResultDto[] = [];
    let matched = 0;
    let notFound = 0;
    let flagged = 0;

    for (const vehicleId of vehicleIds) {
      const vehicle = vehicleById.get(vehicleId);
      if (!vehicle) {
        results.push({ vehicle_id: vehicleId, vehicle_no: '(unknown)', response_status: 'Error', message: 'Vehicle not found in Vehicle Master' });
        notFound++;
        continue;
      }

      const vahanResponse = await callVahanApi(vehicle.registration_no, { referenceId: vehicleId });

      let responseStatus: string;
      let dto: VehicleResultDto;
      let rcStatus: string | null = null;
      let fitnessValidUpto: string | null = null;
      let puccValidUpto: string | null = null;
      let insuranceValidUpto: string | null = null;
      let permitValidUpto: string | null = null;
      let roadTaxPaidUpto: string | null = null;
      let isBlacklisted = false;
      let blacklistReason: string | null = null;
      let gvw: number | null = null;

      if (vahanResponse.status === 'success') {
        const d = vahanResponse.data;
        responseStatus = 'Success';
        rcStatus = d.registration_details.rc_status;
        fitnessValidUpto = d.fitness_and_compliance.fitness_valid_upto;
        puccValidUpto = d.fitness_and_compliance.pucc_valid_upto;
        insuranceValidUpto = d.insurance_details.insurance_valid_upto;
        permitValidUpto = d.permit_details.permit_valid_upto;
        roadTaxPaidUpto = d.tax_details.road_tax_paid_upto;
        isBlacklisted = d.status_flags.is_blacklisted;
        blacklistReason = d.status_flags.blacklist_reason;
        gvw = d.weight_and_capacity.gross_vehicle_weight_kg;
        matched++;
        if (isBlacklisted) flagged++;
      } else {
        responseStatus = vahanResponse.code === 404 ? 'NotFound' : 'InvalidFormat';
        notFound++;
      }

      const { rows: inserted } = await client.query(
        `INSERT INTO vahan_validation_result
          (vehicle_id, vehicle_no, requested_by, response_status, raw_response,
           rc_status, fitness_valid_upto, pucc_valid_upto, insurance_valid_upto, permit_valid_upto,
           road_tax_paid_upto, is_blacklisted, blacklist_reason, gross_vehicle_weight_kg, created_by, updated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15)
         RETURNING result_id`,
        [
          vehicleId,
          vehicle.registration_no,
          userId,
          responseStatus,
          JSON.stringify(vahanResponse),
          rcStatus,
          fitnessValidUpto,
          puccValidUpto,
          insuranceValidUpto,
          permitValidUpto,
          roadTaxPaidUpto,
          isBlacklisted,
          blacklistReason,
          gvw,
          userId,
        ]
      );

      dto = {
        vehicle_id: vehicleId,
        vehicle_no: vehicle.registration_no,
        response_status: responseStatus,
        message: vahanResponse.status === 'error' ? vahanResponse.message : undefined,
        rc_status: rcStatus,
        fitness_valid_upto: fitnessValidUpto,
        pucc_valid_upto: puccValidUpto,
        insurance_valid_upto: insuranceValidUpto,
        permit_valid_upto: permitValidUpto,
        road_tax_paid_upto: roadTaxPaidUpto,
        is_blacklisted: isBlacklisted,
        blacklist_reason: blacklistReason,
        gross_vehicle_weight_kg: gvw,
        result_id: inserted[0]?.result_id,
      };
      results.push(dto);

      // Push near-expiry / expired items into asset_compliance so the existing
      // compliance-expiry alert rule (alertsEngine.evaluateComplianceExpiry)
      // picks them up without any further wiring.
      if (vahanResponse.status === 'success') {
        const warningCutoff = new Date();
        warningCutoff.setDate(warningCutoff.getDate() + COMPLIANCE_WARNING_DAYS);

        const expiryChecks: { date: string | null; code: string }[] = [
          { date: fitnessValidUpto, code: 'FITNESS' },
          { date: puccValidUpto, code: 'PUC' },
          { date: insuranceValidUpto, code: 'INSURANCE' },
          { date: permitValidUpto, code: 'PERMIT' },
          { date: roadTaxPaidUpto, code: 'ROAD_TAX' },
        ];
        for (const check of expiryChecks) {
          if (!check.date) continue;
          if (new Date(check.date) <= warningCutoff) {
            await upsertComplianceAlert(client, vehicleId, check.code, check.date, userId);
          }
        }
      }
    }

    await client.query('COMMIT');

    return ok(res, {
      summary: {
        total: vehicleIds.length,
        matched,
        notFound,
        flagged,
      },
      results,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return fail(res, err.message || 'VAHAN validation failed', 500);
  } finally {
    client.release();
  }
});

export default router;
