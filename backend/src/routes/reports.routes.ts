import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /api/reports/tyre-cost-per-km:
 *   get:
 *     summary: Per-tyre cost-per-km breakdown (purchase + event costs - scrap value, divided by total km run)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Per-tyre cost-per-km report rows }
 */
router.get('/tyre-cost-per-km', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        t.tyre_id,
        t.tyre_serial_no,
        t.brand,
        t.model,
        t.status,
        t.purchase_cost,
        t.scrap_value,
        COALESCE(ev.event_cost_total, 0) AS event_cost_total,
        COALESCE(
          GREATEST(t.total_run_km, ev.max_km_at_event, 0),
          0
        ) AS total_km_run,
        (COALESCE(t.purchase_cost, 0) + COALESCE(ev.event_cost_total, 0) - COALESCE(t.scrap_value, 0)) AS total_cost,
        CASE
          WHEN COALESCE(GREATEST(t.total_run_km, ev.max_km_at_event, 0), 0) > 0
            THEN ROUND(
              (COALESCE(t.purchase_cost, 0) + COALESCE(ev.event_cost_total, 0) - COALESCE(t.scrap_value, 0))
              / GREATEST(t.total_run_km, ev.max_km_at_event, 0),
              4
            )
          ELSE NULL
        END AS cost_per_km
      FROM tyre_master t
      LEFT JOIN (
        SELECT
          tyre_id,
          SUM(event_cost) AS event_cost_total,
          MAX(COALESCE(km_at_event, odometer_km)) AS max_km_at_event
        FROM tyre_movement
        WHERE deleted_flag = false
        GROUP BY tyre_id
      ) ev ON ev.tyre_id = t.tyre_id
      WHERE t.deleted_flag = false
      ORDER BY t.tyre_serial_no
    `);
    return ok(res, { items: rows });
  } catch (err: any) {
    return fail(res, err.message || 'Failed to compute tyre cost-per-km report', 500);
  }
});

export default router;
