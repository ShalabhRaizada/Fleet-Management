import { useCallback, useEffect, useState } from 'react';
import { approvalApi } from '../../api/resources';
import { api, ApiError } from '../../api/client';
import { DataTable, usePagedList } from '../../components/DataTable';
import type { ApprovalRequest } from '../../types/entities';
import { useToast } from '../../components/Toast';

export default function ApprovalInbox() {
  const { addToast } = useToast();
  const [status, setStatus] = useState('Pending');
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(
    (p: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) =>
      approvalApi.list({ ...p, status }),
    [status]
  );
  const { items, page, pageSize, total, setPage, loading, reload } = usePagedList<ApprovalRequest>(fetcher);

  useEffect(() => {
    setPage(1);
  }, [status, setPage]);

  async function decide(row: ApprovalRequest, decision: 'Approved' | 'Rejected') {
    setBusyId(row.approval_id);
    setError(null);
    try {
      await api.post(`/approvals/${row.approval_id}/decide`, {
        decision,
        remarks: remarksById[row.approval_id] || undefined,
      });
      addToast(decision === 'Approved' ? 'Approval granted.' : 'Approval rejected.', decision === 'Approved' ? 'success' : 'info');
      reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Decision failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Approval Inbox</h1>
        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['Pending', 'Approved', 'Rejected', 'Returned', 'Overridden'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <DataTable
        columns={[
          { key: 'transaction_type', header: 'Transaction Type' },
          { key: 'transaction_id', header: 'Transaction ID' },
          { key: 'approval_status', header: 'Status' },
          { key: 'requested_at', header: 'Requested At', render: (r) => new Date(r.requested_at).toLocaleString() },
          ...(status === 'Pending'
            ? [{
                key: 'remarks', header: 'Remarks', render: (r: ApprovalRequest) => (
                  <input
                    className="border border-gray-300 rounded px-2 py-1 text-xs w-40"
                    placeholder="Remarks"
                    value={remarksById[r.approval_id] || ''}
                    onChange={(e) => setRemarksById((prev) => ({ ...prev, [r.approval_id]: e.target.value }))}
                  />
                ),
              }]
            : []),
        ]}
        rows={items}
        rowKey={(r) => r.approval_id}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        loading={loading}
        exportFilename="approvals"
        actions={
          status === 'Pending'
            ? (row) => (
                <div className="flex gap-2">
                  <button disabled={busyId === row.approval_id} onClick={() => decide(row, 'Approved')} className="text-emerald-600 hover:underline">
                    Approve
                  </button>
                  <button disabled={busyId === row.approval_id} onClick={() => decide(row, 'Rejected')} className="text-red-600 hover:underline">
                    Reject
                  </button>
                </div>
              )
            : undefined
        }
      />
    </div>
  );
}
