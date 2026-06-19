import { useEffect, useState } from 'react';
import { maintenanceDueApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { MaintenanceDue } from '../../types/entities-p2p3';

export default function MaintenanceReport() {
  const [records, setRecords] = useState<MaintenanceDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await maintenanceDueApi.list({ page: 1, pageSize: 1000 });
        setRecords(r.items);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load maintenance due records');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  const statusCounts: Record<string, number> = {};
  records.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Maintenance Due Summary Report</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="kpi">
          <div className="label">Total Records</div>
          <div className="value">{records.length}</div>
        </div>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="kpi">
            <div className="label">{status}</div>
            <div className="value">{count}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Status</th>
              <th className="num">Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(statusCounts).map(([status, count]) => (
              <tr key={status}>
                <td>{status}</td>
                <td className="num tnum">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
