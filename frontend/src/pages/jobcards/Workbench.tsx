import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobCardApi, breakdownEventApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { JobCard } from '../../types/entities';
import type { BreakdownEvent } from '../../types/entities-p2p3';

export default function Workbench() {
  const navigate = useNavigate();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [jc, bd] = await Promise.all([
          jobCardApi.list({ page: 1, pageSize: 200 }),
          breakdownEventApi.list({ page: 1, pageSize: 200 }),
        ]);
        setJobCards(jc.items);
        setBreakdowns(bd.items);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  const statusCounts: Record<string, number> = {};
  jobCards.forEach((j) => {
    statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
  });

  const openBreakdowns = breakdowns.filter((b) => b.status !== 'Closed');

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Maintenance Workbench</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="kpi">
            <div className="label">{status}</div>
            <div className="value">{count}</div>
          </div>
        ))}
        <div className="kpi">
          <div className="label">Open Breakdowns</div>
          <div className="value">{openBreakdowns.length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid var(--divider)' }}>Job Cards</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Job Card No</th>
              <th>Type</th>
              <th>Defect Summary</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobCards.map((j) => (
              <tr key={j.job_card_id} className="clickable" onClick={() => navigate(`/job-cards/${j.job_card_id}`)}>
                <td className="mono">{j.job_card_no}</td>
                <td>{j.job_card_type}</td>
                <td>{j.defect_summary}</td>
                <td>{j.priority}</td>
                <td><span className="badge outline">{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid var(--divider)' }}>Open Breakdown Events</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Breakdown Datetime</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {openBreakdowns.map((b) => (
              <tr key={b.breakdown_id} className="clickable" onClick={() => navigate(`/breakdown-events/${b.breakdown_id}`)}>
                <td className="mono">{b.vehicle_id}</td>
                <td>{new Date(b.breakdown_datetime).toLocaleString()}</td>
                <td>{b.breakdown_category}</td>
                <td>{b.severity}</td>
                <td><span className="badge outline">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
