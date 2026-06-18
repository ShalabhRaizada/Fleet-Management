import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from '../utils/envelope';
import { authenticate, requireRole } from '../middleware/auth';
import { submitForApproval, decideApproval, ApprovalError, APPROVER_ROLES } from '../services/approvalWorkflow';

const router = Router();
router.use(authenticate);

const submitSchema = z.object({
  transactionType: z.enum(['job_card', 'asset_compliance']),
  transactionId: z.string().uuid(),
  approvalLevel: z.number().int().optional(),
});

/**
 * @openapi
 * /api/approvals:
 *   get:
 *     summary: List approval requests (approval inbox)
 *     tags: [Approvals]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: status, in: query, schema: { type: string }, description: "Filter by approval_status" }
 *     responses:
 *       200: { description: Paginated approval request list }
 *   post:
 *     summary: Submit a transaction (job_card or asset_compliance) for approval
 *     tags: [Approvals]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Approval request created }
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
      where.push(`approval_status = $${params.length}`);
    }
    if (req.query.transactionType) {
      params.push(req.query.transactionType);
      where.push(`transaction_type = $${params.length}`);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const countResult = await pool.query(`SELECT COUNT(*) FROM approval_request ${whereSql}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    params.push(pageSize, offset);
    const { rows } = await pool.query(
      `SELECT * FROM approval_request ${whereSql} ORDER BY requested_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return ok(res, { items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
  } catch (err: any) {
    return fail(res, err.message || 'List failed', 500);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Validation failed', 422, parsed.error.issues);
  try {
    const row = await submitForApproval({
      transactionType: parsed.data.transactionType,
      transactionId: parsed.data.transactionId,
      requestedByUserId: req.user!.user_id,
      approvalLevel: parsed.data.approvalLevel,
    });
    return ok(res, row, 'Approval request submitted', 201);
  } catch (err: any) {
    return fail(res, err.message || 'Submit failed', err.statusCode || 500);
  }
});

/**
 * @openapi
 * /api/approvals/{id}/decide:
 *   post:
 *     summary: Approve or reject a pending approval request (Finance/Approver, Fleet Manager, or Admin only)
 *     tags: [Approvals]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision: { type: string, enum: [Approved, Rejected] }
 *               remarks: { type: string }
 *     responses:
 *       200: { description: Decision recorded }
 *       403: { description: Insufficient role to decide }
 */
const decisionSchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  remarks: z.string().max(500).optional().nullable(),
});

router.post('/:id/decide', requireRole(...APPROVER_ROLES), async (req: Request, res: Response) => {
  const parsed = decisionSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 'Validation failed', 422, parsed.error.issues);
  try {
    const row = await decideApproval({
      approvalId: req.params.id,
      approverUserId: req.user!.user_id,
      approverRoleCode: req.user!.role_code,
      decision: parsed.data.decision,
      remarks: parsed.data.remarks,
    });
    return ok(res, row, `Approval ${parsed.data.decision.toLowerCase()}`);
  } catch (err: any) {
    const status = err instanceof ApprovalError ? err.statusCode : 500;
    return fail(res, err.message || 'Decision failed', status);
  }
});

export default router;
