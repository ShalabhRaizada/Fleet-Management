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

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900">
      <aside className="w-60 bg-gray-900 text-gray-100 flex flex-col">
        <div className="px-4 py-4 text-lg font-semibold border-b border-gray-800">Fleet Management</div>
        <nav className="flex-1 overflow-y-auto py-2">
          {visibleMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm hover:bg-gray-800 ${isActive ? 'bg-gray-800 text-white font-medium' : 'text-gray-300'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <div className="text-sm text-gray-500">
            {crumbs.length ? crumbs.join(' / ') : 'Home'}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-700">
              {user?.display_name || user?.login_id} <span className="text-gray-400">({user?.role_code})</span>
            </span>
            <button onClick={() => logout()} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
