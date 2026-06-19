import { useEffect, useState } from 'react';
import { vehicleApi, complianceApi } from '../../api/resources';
import { maintenanceDueApi, breakdownEventApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { Vehicle, AssetCompliance } from '../../types/entities';
import type { MaintenanceDue, BreakdownEvent } from '../../types/entities-p2p3';

const COMPLIANCE_SOON_DAYS = 30;

export default function FleetHealthReport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDue[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownEvent[]>([]);
  const [compliance, setCompliance] = useState<AssetCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [v, md, bd, ac] = await Promise.all([
          vehicleApi.list({ page: 1, pageSize: 1000 }),
          maintenanceDueApi.list({ page: 1, pageSize: 1000 }),
          breakdownEventApi.list({ page: 1, pageSize: 1000 }),
          complianceApi.list({ page: 1, pageSize: 1000 }),
        ]);
        setVehicles(v.items);
        setMaintenanceDue(md.items);
        setBreakdowns(bd.items);
        setCompliance(ac.items);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load fleet health data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  const statusCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  });

  const overdueMaintenanceCount = maintenanceDue.filter((m) => m.status === 'Overdue' || m.status === 'Due').length;
  const openBreakdownCount = breakdowns.filter((b) => b.status !== 'Closed' && b.status !== 'Resolved').length;

  const now = Date.now();
  const soonCutoff = now + COMPLIANCE_SOON_DAYS * 24 * 60 * 60 * 1000;
  const complianceExpiringSoonCount = compliance.filter((c) => {
    if (!c.valid_upto) return false;
    const t = new Date(c.valid_upto).getTime();
    return t >= now && t <= soonCutoff;
  }).length;

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Fleet Health Dashboard</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="kpi">
          <div className="label">Total Vehicles</div>
          <div className="value">{vehicles.length}</div>
        </div>
        <div className="kpi">
          <div className="label">Overdue Maintenance</div>
          <div className="value">{overdueMaintenanceCount}</div>
        </div>
        <div className="kpi">
          <div className="label">Open Breakdowns</div>
          <div className="value">{openBreakdownCount}</div>
        </div>
        <div className="kpi">
          <div className="label">Compliance Expiring Soon ({COMPLIANCE_SOON_DAYS}d)</div>
          <div className="value">{complianceExpiringSoonCount}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vehicle Status</th>
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
