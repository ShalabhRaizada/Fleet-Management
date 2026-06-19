import { Router, Request, Response } from 'express';
import multer from 'multer';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { authenticate, requireRole } from '../middleware/auth';
import { ROLES } from '../constants/roles';

const router = Router();
router.use(authenticate);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Vehicle statuses considered "working" - rows with these statuses are skipped
// (no actionable record created) since the vehicle is not actually non-working.
const WORKING_STATUSES = new Set(['available', 'intrip']);

interface ParsedRow {
  vehicle_no: string;
  epic_status: string;
}

/** Minimal CSV parser sufficient for this internal upload tool: splits on
 * newlines then commas. Does not handle quoted commas/embedded newlines,
 * which is an acceptable limitation for this simple operational upload. */
function parseCsv(content: string): ParsedRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (!lines.length) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const vehicleNoIdx = header.findIndex((h) => h === 'vehicle_no' || h === 'vehicle no' || h === 'registration_no');
  const statusIdx = header.findIndex((h) => h === 'epic_status' || h === 'status');

  if (vehicleNoIdx === -1 || statusIdx === -1) {
    throw new Error('CSV must contain "vehicle_no" and "epic_status" columns');
  }

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const vehicle_no = cols[vehicleNoIdx] || '';
    const epic_status = cols[statusIdx] || '';
    if (!vehicle_no) continue;
    rows.push({ vehicle_no, epic_status });
  }
  return rows;
}

/**
 * @openapi
 * /api/epic-upload:
 *   post:
 *     summary: Upload an EPIC vehicle status CSV file, reconcile rows against vehicle_master and create non_working_vehicle_action records for non-working vehicles (P1)
 *     tags: [Vehicle Status]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Upload processed }
 */
router.post(
  '/',
  requireRole(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR),
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) return fail(res, 'No file uploaded (expected multipart field "file")', 400);

    let rows: ParsedRow[];
    try {
      rows = parseCsv(req.file.buffer.toString('utf-8'));
    } catch (err: any) {
      return fail(res, err.message || 'Failed to parse CSV', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const uploadResult = await client.query(
        `INSERT INTO epic_status_upload (uploaded_by, file_name, total_rows, matched_rows, unmatched_rows, status, created_by, updated_by)
         VALUES ($1, $2, $3, 0, 0, 'Processing', $1, $1) RETURNING *`,
        [req.user?.user_id || null, req.file.originalname, rows.length]
      );
      const uploadRow = uploadResult.rows[0];

      let matched = 0;
      let unmatched = 0;

      for (const row of rows) {
        if (WORKING_STATUSES.has((row.epic_status || '').trim().toLowerCase())) {
          continue;
        }

        const vehResult = await client.query(
          `SELECT vehicle_id FROM vehicle_master WHERE registration_no = $1 AND deleted_flag = false LIMIT 1`,
          [row.vehicle_no]
        );
        const vehicleId = vehResult.rows[0]?.vehicle_id || null;
        if (vehicleId) matched++;
        else unmatched++;

        await client.query(
          `INSERT INTO non_working_vehicle_action
            (upload_id, vehicle_id, vehicle_no_raw, epic_status_raw, escalation_level, resolved, created_by, updated_by)
           VALUES ($1, $2, $3, $4, 0, false, $5, $5)`,
          [uploadRow.upload_id, vehicleId, vehicleId ? null : row.vehicle_no, row.epic_status, req.user?.user_id || null]
        );
      }

      const finalUpload = await client.query(
        `UPDATE epic_status_upload SET matched_rows = $1, unmatched_rows = $2, status = 'Completed', updated_by = $3, updated_at = now()
         WHERE upload_id = $4 RETURNING *`,
        [matched, unmatched, req.user?.user_id || null, uploadRow.upload_id]
      );

      await client.query('COMMIT');
      return ok(res, finalUpload.rows[0], 'Upload processed', 201);
    } catch (err: any) {
      await client.query('ROLLBACK');
      return fail(res, err.message || 'Upload processing failed', 500);
    } finally {
      client.release();
    }
  }
);

export default router;
