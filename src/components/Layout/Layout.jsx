import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const BOTTOM_NAV = [
  { to: '/', icon: '📊', label: 'Home', end: true },
  { to: '/properties', icon: '🏢', label: 'Properties' },
  { to: '/clients', icon: '👥', label: 'Clients' },
  { to: '/leads', icon: '📋', label: 'Leads' },
  { to: '/viewings', icon: '📅', label: 'Viewings' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg dark:bg-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop (persistent) */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Sidebar - mobile (overlay) */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onCollapseClick={() => setSidebarCollapsed((c) => !c)}
          sidebarCollapsed={sidebarCollapsed}
        />
        {/* Extra bottom padding on mobile to clear the bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation — mobile only */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-brand-navy border-t border-white/10 flex items-center justify-around safe-area-inset-bottom">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors ${
                isActive ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
