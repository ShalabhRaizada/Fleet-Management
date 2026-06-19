import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ApiError } from '../../api/client';

interface TyreCostRow {
  tyre_id: string;
  tyre_serial_no: string;
  brand: string | null;
  model: string | null;
  status: string;
  purchase_cost: string | number | null;
  scrap_value: string | number | null;
  event_cost_total: string | number;
  total_km_run: string | number;
  total_cost: string | number;
  cost_per_km: string | number | null;
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === 'number' ? v : parseFloat(v);
}

export default function TyreCostReport() {
  const [rows, setRows] = useState<TyreCostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await api.get<{ items: TyreCostRow[] }>('/reports/tyre-cost-per-km');
        setRows(r.items);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load tyre cost report');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  const totalCost = rows.reduce((s, r) => s + num(r.total_cost), 0);
  const avgCostPerKm =
    rows.filter((r) => r.cost_per_km !== null).reduce((s, r) => s + num(r.cost_per_km), 0) /
    (rows.filter((r) => r.cost_per_km !== null).length || 1);

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Tyre Cost-per-KM Report</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="kpi">
          <div className="label">Tyres Tracked</div>
          <div className="value">{rows.length}</div>
        </div>
        <div className="kpi">
          <div className="label">Total Lifecycle Cost</div>
          <div className="value">{totalCost.toFixed(2)}</div>
        </div>
        <div className="kpi">
          <div className="label">Avg Cost / Km</div>
          <div className="value">{avgCostPerKm.toFixed(4)}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Brand / Model</th>
              <th>Status</th>
              <th className="num">Purchase Cost</th>
              <th className="num">Event Costs</th>
              <th className="num">Scrap Value</th>
              <th className="num">Total Cost</th>
              <th className="num">Total Km Run</th>
              <th className="num">Cost / Km</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tyre_id}>
                <td>{r.tyre_serial_no}</td>
                <td>{[r.brand, r.model].filter(Boolean).join(' / ') || '-'}</td>
                <td>{r.status}</td>
                <td className="num tnum">{num(r.purchase_cost).toFixed(2)}</td>
                <td className="num tnum">{num(r.event_cost_total).toFixed(2)}</td>
                <td className="num tnum">{num(r.scrap_value).toFixed(2)}</td>
                <td className="num tnum">{num(r.total_cost).toFixed(2)}</td>
                <td className="num tnum">{num(r.total_km_run).toFixed(1)}</td>
                <td className="num tnum">{r.cost_per_km !== null ? num(r.cost_per_km).toFixed(4) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
