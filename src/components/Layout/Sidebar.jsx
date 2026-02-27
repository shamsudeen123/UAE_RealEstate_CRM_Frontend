import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'agent', 'accountant'] },
  { to: '/properties', icon: '🏢', label: 'Properties', roles: ['admin', 'agent', 'accountant'] },
  { to: '/clients', icon: '👥', label: 'Clients', roles: ['admin', 'agent', 'accountant'] },
  { to: '/leads', icon: '📋', label: 'Leads', roles: ['admin', 'agent', 'accountant'] },
  { to: '/deals', icon: '🤝', label: 'Deals', roles: ['admin', 'agent', 'accountant'] },
  { to: '/viewings', icon: '📅', label: 'Viewings', roles: ['admin', 'agent', 'accountant'] },
  { to: '/expenses', icon: '💸', label: 'Expenses', roles: ['admin', 'accountant'] },
  // { to: '/invoices', icon: '🧾', label: 'Invoices', roles: ['admin', 'accountant'] },
  { to: '/reports', icon: '📈', label: 'Reports', roles: ['admin', 'accountant'] },
  // { to: '/staff', icon: '👤', label: 'Staff', roles: ['admin'] },
];

export default function Sidebar({ collapsed, onClose }) {
  const { user, can } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => can(...item.roles));

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className={`flex flex-col h-full bg-brand-navy transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-9 h-9 rounded-lg bg-brand-gold flex items-center justify-center text-lg flex-shrink-0">
          🏠
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">UAE Real Estate</p>
            <p className="text-brand-light text-xs">CRM Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={() =>
              collapsed
                ? `sidebar-link-collapsed${isActive(item.to) ? ' active' : ''}`
                : `sidebar-link${isActive(item.to) ? ' active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
