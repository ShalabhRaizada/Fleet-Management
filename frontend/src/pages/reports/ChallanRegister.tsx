import { useEffect, useState } from 'react';
import { challanApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { Challan } from '../../types/entities';

export default function ChallanRegister() {
  const [records, setRecords] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await challanApi.list({ page: 1, pageSize: 1000 });
        setRecords(r.items);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load challan records');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  const groups: Record<string, { count: number; total: number }> = {};
  records.forEach((c) => {
    const key = c.payment_status || 'Unknown';
    if (!groups[key]) groups[key] = { count: 0, total: 0 };
    groups[key].count += 1;
    groups[key].total += Number(c.amount) || 0;
  });

  const grandTotal = records.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Challan Register</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="kpi">
          <div className="label">Total Challans</div>
          <div className="value">{records.length}</div>
        </div>
        <div className="kpi">
          <div className="label">Total Amount</div>
          <div className="value">{grandTotal.toFixed(2)}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Payment Status</th>
              <th className="num">Count</th>
              <th className="num">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([status, g]) => (
              <tr key={status}>
                <td>{status}</td>
                <td className="num tnum">{g.count}</td>
                <td className="num tnum">{g.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
