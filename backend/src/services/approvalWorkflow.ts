import { pool } from '../db/pool';
import { APPROVER_ROLES } from '../constants/roles';

/**
 * Generic approval workflow state machine.
 *
 * Transaction lifecycle (applies to job_card estimates and asset_compliance
 * hold-overrides, per task spec):
 *   draft -> submitted -> approved | rejected
 *
 * Implementation notes:
 * - "submitted" creates a row in approval_request (transaction_type/transaction_id)
 *   with approval_status='Pending'.
 * - Only users whose role_code is in APPROVER_ROLES may decide (approve/reject).
 * - On decision, approval_request.approval_status is updated and, for known
 *   transaction_type handlers, the underlying business record's status is
 *   advanced (e.g. job_card.status -> 'Assigned' on approval).
 */

export { APPROVER_ROLES };

export type TransactionType = 'job_card' | 'asset_compliance';

export interface SubmitApprovalInput {
  transactionType: TransactionType;
  transactionId: string;
  requestedByUserId: string;
  approvalLevel?: number;
}

export async function submitForApproval(input: SubmitApprovalInput) {
  const { rows } = await pool.query(
    `INSERT INTO approval_request
       (transaction_type, transaction_id, requested_by_user_id, requested_at, approval_level, approval_status, created_by, updated_by)
     VALUES ($1, $2, $3, now(), $4, 'Pending', $3, $3)
     RETURNING *`,
    [input.transactionType, input.transactionId, input.requestedByUserId, input.approvalLevel ?? 1]
  );
  return rows[0];
}

export interface DecideApprovalInput {
  approvalId: string;
  approverUserId: string;
  approverRoleCode: string;
  decision: 'Approved' | 'Rejected';
  remarks?: string | null;
}

export class ApprovalError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function decideApproval(input: DecideApprovalInput) {
  if (!(APPROVER_ROLES as string[]).includes(input.approverRoleCode)) {
    throw new ApprovalError('Only Finance/Approver, Fleet Manager or Admin roles may approve or reject', 403);
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: reqRows } = await client.query(
      `SELECT * FROM approval_request WHERE approval_id = $1 AND deleted_flag = false FOR UPDATE`,
      [input.approvalId]
    );
    if (!reqRows.length) throw new ApprovalError('Approval request not found', 404);
    const reqRow = reqRows[0];
    if (reqRow.approval_status !== 'Pending') {
      throw new ApprovalError(`Approval request already decided (status=${reqRow.approval_status})`, 409);
    }

    const { rows: updated } = await client.query(
      `UPDATE approval_request
         SET approval_status = $1, approver_user_id = $2, decision_at = now(), remarks = $3, updated_by = $2
       WHERE approval_id = $4
       RETURNING *`,
      [input.decision, input.approverUserId, input.remarks ?? null, input.approvalId]
    );

    await applyDecisionToTransaction(client, reqRow.transaction_type, reqRow.transaction_id, input.decision);

    await client.query('COMMIT');
    return updated[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function applyDecisionToTransaction(client: any, transactionType: string, transactionId: string, decision: 'Approved' | 'Rejected') {
  if (transactionType === 'job_card') {
    const newStatus = decision === 'Approved' ? 'Assigned' : 'Cancelled';
    await client.query(`UPDATE job_card SET status = $1, updated_at = now() WHERE job_card_id = $2`, [newStatus, transactionId]);
  } else if (transactionType === 'asset_compliance') {
    const newStatus = decision === 'Approved' ? 'UnderRenewal' : 'Expired';
    await client.query(`UPDATE asset_compliance SET status = $1, updated_at = now() WHERE asset_compliance_id = $2`, [newStatus, transactionId]);
  }
  // Unrecognized transaction types are left as-is (approval_request itself still records the decision).
}
