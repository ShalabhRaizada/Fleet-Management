import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  to: string;
  label: string;
  roles?: string[]; // if omitted, visible to all authenticated roles
}

const MENU: MenuItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/trailers', label: 'Trailers', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/couplings', label: 'Coupling', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/fuel', label: 'Fuel', roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER'] },
  { to: '/compliance', label: 'Compliance', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/job-cards', label: 'Job Cards', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/workshops', label: 'Workshops', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/tyres', label: 'Tyres', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/accessories', label: 'Accessories', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/accompaniments', label: 'Accompaniments', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/approvals', label: 'Approval Inbox' },
  { to: '/reports/cost', label: 'Cost Report', roles: ['ADMIN', 'FLEET_MANAGER', 'APPROVER'] },
  { to: '/alerts', label: 'Alerts / Exceptions' },

  { to: '/inspection-templates', label: 'Inspection Templates', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/inspection-events', label: 'Inspection Events', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/inspection-result-lines', label: 'Inspection Result Lines', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/route-fuel-norms', label: 'Route Fuel Norms', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/compliance-alerts', label: 'Compliance Alerts', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/trips', label: 'Trips', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/toll-transactions', label: 'Toll Transactions', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/approval-matrix', label: 'Approval Matrix', roles: ['ADMIN'] },
  { to: '/maintenance-schedules', label: 'Maintenance Schedules', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/maintenance-due', label: 'Maintenance Due', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/breakdown-events', label: 'Breakdown Events', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/accident-events', label: 'Accident Events', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/payable-validations', label: 'Payable Validations', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/stock-ledger', label: 'Stock Ledger', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/integration-configs', label: 'Integration Configs', roles: ['ADMIN'] },
  { to: '/ulip-api-logs', label: 'ULIP API Logs', roles: ['ADMIN'] },
  { to: '/alert-rules', label: 'Alert Rules', roles: ['ADMIN'] },
  { to: '/documents', label: 'Documents', roles: ['ADMIN', 'FLEET_MANAGER'] },

  { to: '/vendors', label: 'Vendors', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/users', label: 'Users', roles: ['ADMIN'] },
  { to: '/pdi', label: 'PDI', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/workbench', label: 'Workbench', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/vehicles/non-working', label: 'Non-Working Vehicles', roles: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'] },
  { to: '/challans', label: 'Challans' },
  { to: '/reports/compliance', label: 'Compliance Report', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/reports/maintenance', label: 'Maintenance Report', roles: ['ADMIN', 'FLEET_MANAGER'] },
  { to: '/settings', label: 'Settings', roles: ['ADMIN'] },
];

function breadcrumbFromPath(pathname: string): string[] {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((seg) => seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
}

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const crumbs = breadcrumbFromPath(location.pathname);

  const visibleMenu = MENU.filter((item) => !item.roles || (user && item.roles.includes(user.role_code)));
  const initials = (user?.display_name || user?.login_id || '?')
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GL</div>
          <div className="brand-name">
            <b>GreenLine VMS</b>
            <span>Fleet Management</span>
          </div>
        </div>
        <div className="role-pill">
          <span className="dot" />
          <span className="role-name">{user?.role_code}</span>
        </div>
        <nav className="nav">
          {visibleMenu.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="footer">
          <div className="avatar">{initials}</div>
          <div className="user-meta">
            <b>{user?.display_name || user?.login_id}</b>
            <span>{user?.login_id}</span>
          </div>
          <button onClick={() => logout()} className="icon-btn" title="Logout">
            ⏻
          </button>
        </div>
      </aside>
      <div className="topbar">
        <div className="crumb">
          {crumbs.length ? (
            crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="sep">/</span>} <b>{c}</b>
              </span>
            ))
          ) : (
            <b>Home</b>
          )}
        </div>
      </div>
      <main className="main">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
