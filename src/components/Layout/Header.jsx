import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick, onCollapseClick, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-brand-navy border-b border-white/10 flex items-center justify-between px-4 gap-4 flex-shrink-0">
      {/* Left: menu toggles */}
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          ☰
        </button>
        {/* Desktop collapse toggle */}
        <button
          onClick={onCollapseClick}
          className="hidden lg:flex p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          aria-label="Toggle sidebar"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
        <span className="text-white/60 text-sm hidden sm:block">UAE Real Estate CRM</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition text-lg"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* User name */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg">
          <span className="text-slate-200 text-sm font-medium">{user?.name}</span>
          <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition text-sm"
          title="Logout"
        >
          🚪
        </button>
      </div>
    </header>
  );
}
