import { Link } from 'react-router-dom';

const REPORTS = [
  { to: '/reports/cost', name: 'Vehicle Cost Report', desc: 'Cost ledger entries by category and source.' },
  { to: '/reports/compliance', name: 'Compliance Summary', desc: 'Asset compliance records grouped by status.' },
  { to: '/reports/maintenance', name: 'Maintenance Due Summary', desc: 'Maintenance due records grouped by status.' },
];

export default function ReportsHome() {
  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Reports</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {REPORTS.map((r) => (
          <Link key={r.to} to={r.to} className="card" style={{ padding: 16, display: 'block', textDecoration: 'none' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>{r.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
