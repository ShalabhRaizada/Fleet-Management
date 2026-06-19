import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { tableColumns } from '../utils/schemaSpec';
import { authenticate, requireRole } from '../middleware/auth';
import { ROLES } from '../constants/roles';

// Dedicated read-only router for the immutable audit_log table.
//
// audit_log intentionally has no deleted_flag/updated_at columns (it is
// write-once, written exclusively by buildCrudRouter's audit hook), so the
// generic buildCrudRouter (which hardcodes `deleted_flag = false` in its
// WHERE clauses) cannot be mounted on it directly. This router re-implements
// GET list/one against the real column set, plus a legal-hold toggle that is
// the only mutation ever allowed on this table.

const router = Router();
router.use(authenticate);

const validCols = new Set(tableColumns('audit_log'));

/**
 * @openapi
 * /api/audit-log:
 *   get:
 *     summary: List audit log entries (paginated, filterable) - immutable, read-only except legal-hold toggle
 *     tags: [Audit]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated audit log list }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) || '20', 10), 1), 200);
    const offset = (page - 1) * pageSize;
    const where: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(req.query)) {
      if (['page', 'pageSize', 'q', 'sortBy', 'sortDir', 'export'].includes(key)) continue;
      if (!validCols.has(key) || value === undefined || value === '') continue;
      params.push(value);
      where.push(`"${key}" = $${params.length}`);
    }

    let sortBy = (req.query.sortBy as string) || 'changed_at';
    if (!validCols.has(sortBy)) sortBy = 'changed_at';
    const sortDir = (req.query.sortDir as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM audit_log ${whereSql}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(pageSize, offset);
    const { rows } = await pool.query(
      `SELECT * FROM audit_log ${whereSql} ORDER BY "${sortBy}" ${sortDir} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return ok(res, { items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (err: any) {
    return fail(res, err.message || 'List failed', 500);
  }
});

/**
 * @openapi
 * /api/audit-log/{id}:
 *   get:
 *     summary: Get a single audit log entry
 *     tags: [Audit]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Audit log entry }
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM audit_log WHERE audit_id = $1`, [req.params.id]);
    if (!rows.length) return fail(res, 'audit_log not found', 404);
    return ok(res, rows[0]);
  } catch (err: any) {
    return fail(res, err.message || 'Fetch failed', 500);
  }
});

const legalHoldSchema = z.object({
  legal_hold: z.boolean(),
});

/**
 * @openapi
 * /api/audit-log/{id}/legal-hold:
 *   patch:
 *     summary: Set the legal_hold flag on an audit log entry (ADMIN only)
 *     tags: [Audit]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Updated audit log entry }
 */
router.patch('/:id/legal-hold', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  const parsed = legalHoldSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Validation failed', 422, parsed.error.issues);

  try {
    const { rows } = await pool.query(
      `UPDATE audit_log SET legal_hold = $1 WHERE audit_id = $2 RETURNING *`,
      [parsed.data.legal_hold, req.params.id]
    );
    if (!rows.length) return fail(res, 'audit_log not found', 404);
    return ok(res, rows[0], 'Legal hold updated');
  } catch (err: any) {
    return fail(res, err.message || 'Legal hold update failed', 500);
  }
});

// Explicitly block create/update/delete - audit_log is append-only besides
// the legal-hold toggle above.
router.post('/', (_req, res) => res.status(403).json({ success: false, message: 'Create not allowed; audit_log is written automatically', data: null, errors: null }));
router.put('/:id', (_req, res) => res.status(403).json({ success: false, message: 'Update not allowed; audit_log is immutable', data: null, errors: null }));
router.delete('/:id', (_req, res) => res.status(403).json({ success: false, message: 'Delete not allowed; audit_log is immutable', data: null, errors: null }));

export default router;
