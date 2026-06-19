import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleApi, trailerApi, costLedgerApi, alertApi } from '../api/resources';
import { ApiError } from '../api/client';

interface Summary {
  totalVehicles: number;
  availableVehicles: number;
  totalTrailers: number;
  availableTrailers: number;
  totalCostThisPage: number;
  openAlerts: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [vehicles, availableVehicles, trailers, availableTrailers, costLedger, openAlerts] = await Promise.all([
        vehicleApi.list({ page: 1, pageSize: 1 }),
        vehicleApi.list({ page: 1, pageSize: 1, status: 'Available' }),
        trailerApi.list({ page: 1, pageSize: 1 }),
        trailerApi.list({ page: 1, pageSize: 1, status: 'Available' }),
        costLedgerApi.list({ page: 1, pageSize: 50 }),
        alertApi.list({ page: 1, pageSize: 1, status: 'Open' }),
      ]);
      setSummary({
        totalVehicles: vehicles.total,
        availableVehicles: availableVehicles.total,
        totalTrailers: trailers.total,
        availableTrailers: availableTrailers.total,
        totalCostThisPage: costLedger.items.reduce((sum, r) => sum + Number(r.amount || 0), 0),
        openAlerts: openAlerts.total,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    }
  }

  if (error) return <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>;
  if (!summary) return <div className="muted">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Vehicles', value: summary.totalVehicles, path: '/vehicles' },
    { label: 'Available Vehicles', value: summary.availableVehicles, path: '/vehicles' },
    { label: 'Total Trailers', value: summary.totalTrailers, path: '/trailers' },
    { label: 'Available Trailers', value: summary.availableTrailers, path: '/trailers' },
    { label: 'Cost Ledger (page total)', value: summary.totalCostThisPage.toFixed(2), path: '/reports/cost' },
    { label: 'Open Alerts', value: summary.openAlerts, path: '/alerts' },
  ];

  return (
    <div className="col gap-24">
      <div className="page-header">
        <h1>Fleet Dashboard</h1>
        <button onClick={() => load()} className="btn">
          Refresh
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            className="kpi cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(c.path)}
          >
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
