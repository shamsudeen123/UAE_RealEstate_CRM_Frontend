import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const STATS = [
  { value: 'Live', label: 'Active Listings' },
  { value: 'Live', label: 'Leads Pipeline' },
  { value: '7', label: 'Emirates Covered' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK' ? `Network error — is backend running on port 5002?` : null)
        || err.message
        || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-navy">

      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden px-14 py-12 bg-gradient-to-br from-brand-navy via-[#112244] to-brand-navy-dark">

        {/* Gold accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold" />

        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full bg-brand-gold/5 blur-2xl pointer-events-none" />

        {/* Logo + branding */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/30">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">UAE Real Estate</p>
              <p className="text-brand-light text-xs tracking-widest uppercase">CRM Platform</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Your Gateway to<br />
            <span className="text-brand-gold">Premium Properties</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xs leading-relaxed">
            Manage listings, clients, deals and viewings — all in one powerful platform built for UAE real estate professionals.
          </p>
        </div>

        {/* CSS city skyline */}
        <div className="flex items-end gap-1 h-28 my-10 opacity-25 select-none">
          {[18,30,22,42,28,55,32,48,25,38,20,45,35,28,40,22,50,30,24,36].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-gold rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
              <p className="text-2xl font-bold text-brand-gold">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center">
            <span className="text-xl">🏠</span>
          </div>
          <p className="text-brand-navy dark:text-white font-bold text-lg">UAE Real Estate CRM</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Welcome back</h2>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800
                           text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800
                           text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-white font-semibold text-sm
                         transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-brand-gold/20"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 dark:text-slate-600 text-xs mt-10">
            UAE Real Estate CRM © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
