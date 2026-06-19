import { useCallback, useEffect, useState } from 'react';
import { alertApi } from '../../api/resources';
import { api, ApiError } from '../../api/client';
import { DataTable, usePagedList } from '../../components/DataTable';
import type { AlertEvent } from '../../types/entities';
import { useAuth } from '../../context/AuthContext';

export default function AlertDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Open');
  const [severity, setSeverity] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const fetcher = useCallback(
    (p: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) =>
      alertApi.list({ ...p, status: status || undefined, severity: severity || undefined }),
    [status, severity]
  );
  const { items, page, pageSize, total, setPage, loading, reload } = usePagedList<AlertEvent>(fetcher);

  useEffect(() => {
    setPage(1);
  }, [status, severity, setPage]);

  async function acknowledge(row: AlertEvent) {
    setBusyId(row.alert_id);
    setError(null);
    try {
      await api.post(`/alerts/${row.alert_id}/acknowledge`);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Acknowledge failed');
    } finally {
      setBusyId(null);
    }
  }

  async function runEvaluation() {
    setEvaluating(true);
    setError(null);
    try {
      await api.post('/alerts/evaluate');
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  }

  const canEvaluate = user && ['ADMIN', 'FLEET_MANAGER'].includes(user.role_code);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Alerts / Exceptions</h1>
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
          {canEvaluate && (
            <button onClick={runEvaluation} disabled={evaluating} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">
              {evaluating ? 'Evaluating...' : 'Run Evaluation'}
            </button>
          )}
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <DataTable
        columns={[
          { key: 'severity', header: 'Severity', sortable: true },
          { key: 'alert_type', header: 'Type' },
          { key: 'message', header: 'Message' },
          { key: 'created_at', header: 'Created At', render: (r) => new Date(r.created_at).toLocaleString(), sortable: true },
          { key: 'status', header: 'Status' },
        ]}
        rows={items}
        rowKey={(r) => r.alert_id}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        loading={loading}
        exportFilename="alerts"
        actions={(row) =>
          row.status === 'Open' ? (
            <button disabled={busyId === row.alert_id} onClick={() => acknowledge(row)} className="text-emerald-600 hover:underline">
              Acknowledge
            </button>
          ) : null
        }
      />
    </div>
  );
}
