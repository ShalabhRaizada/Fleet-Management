import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { authenticate, requireRole } from '../middleware/auth';
import { evaluateAlerts } from '../services/alertsEngine';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /api/alerts:
 *   get:
 *     summary: List alert events
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: severity, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated alert list }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) || '20', 10), 1), 200);
    const offset = (page - 1) * pageSize;
    const where: string[] = ['deleted_flag = false'];
    const params: any[] = [];
    if (req.query.status) {
      params.push(req.query.status);
      where.push(`status = $${params.length}`);
    }
    if (req.query.severity) {
      params.push(req.query.severity);
      where.push(`severity = $${params.length}`);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const countResult = await pool.query(`SELECT COUNT(*) FROM alert_event ${whereSql}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    params.push(pageSize, offset);
    const { rows } = await pool.query(
      `SELECT * FROM alert_event ${whereSql} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return ok(res, { items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (err: any) {
    return fail(res, err.message || 'List failed', 500);
  }
});

/**
 * @openapi
 * /api/alerts/evaluate:
 *   post:
 *     summary: Run the alerts engine now (compliance expiry + maintenance due rules)
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Evaluation result with counts of newly created alerts }
 */
router.post('/evaluate', requireRole('ADMIN', 'FLEET_MANAGER'), async (_req: Request, res: Response) => {
  try {
    const result = await evaluateAlerts();
    return ok(res, result, 'Alerts evaluated');
  } catch (err: any) {
    return fail(res, err.message || 'Evaluation failed', 500);
  }
});

/**
 * @openapi
 * /api/alerts/{id}/acknowledge:
 *   post:
 *     summary: Acknowledge/close an alert
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Alert acknowledged }
 */
router.post('/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `UPDATE alert_event SET status = 'Closed', updated_by = $2, updated_at = now() WHERE alert_id = $1 AND deleted_flag = false RETURNING *`,
      [req.params.id, req.user!.user_id]
    );
    if (!rows.length) return fail(res, 'Alert not found', 404);
    return ok(res, rows[0], 'Alert acknowledged');
  } catch (err: any) {
    return fail(res, err.message || 'Failed', 500);
  }
});

export default router;
