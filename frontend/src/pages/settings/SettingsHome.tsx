import { Link } from 'react-router-dom';

const SECTIONS = [
  { to: '/integration-configs', name: 'Integration Configs', desc: 'Manage external system integrations (ULIP, etc.) and credentials.' },
  { to: '/alert-rules', name: 'Alert Rules', desc: 'Configure thresholds and severities for automated fleet alerts.' },
  { to: '/approval-matrix', name: 'Approval Matrix', desc: 'Define approval levels and limits for workflow requests.' },
  { to: '/users', name: 'Users & Roles', desc: 'Manage user accounts, roles and access status.' },
  { to: '/settings/mfa', name: 'Two-Factor Authentication', desc: 'Enable or disable TOTP-based two-factor login on your account.' },
];

export default function SettingsHome() {
  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="card" style={{ padding: 16, display: 'block', textDecoration: 'none' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
