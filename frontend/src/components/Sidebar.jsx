import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const USER_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/scan/phishing', label: 'Phishing Scanner', icon: '📧' },
  { to: '/scan/message', label: 'Message Analyzer', icon: '💬' },
  { to: '/scan/url', label: 'URL Scanner', icon: '🔗' },
  { to: '/scan/screenshot', label: 'Screenshot Analyzer', icon: '🖼️' },
  { to: '/scan/password', label: 'Password Checker', icon: '🔑' },
  { to: '/history', label: 'Scan History', icon: '🗂️' },
  { to: '/tips', label: 'Cybersecurity Tips', icon: '📚' },
  { to: '/quiz', label: 'Security Quiz', icon: '🧠' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Admin Dashboard', icon: '🛡️' },
  { to: '/admin/users', label: 'Manage Users', icon: '👥' },
  { to: '/admin/analyses', label: 'Analysis Records', icon: '📈' },
  { to: '/admin/articles', label: 'Manage Articles', icon: '📝' },
  { to: '/admin/quiz', label: 'Manage Quiz', icon: '❓' },
  { to: '/admin/logs', label: 'System Logs', icon: '🧾' },
];

export default function Sidebar({ mode = 'user' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = mode === 'admin' ? ADMIN_LINKS : USER_LINKS;

  const handleLogout = () => {
    logout();
    navigate(mode === 'admin' ? '/admin/login' : '/login');
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-bg-panel border-b border-bg-border px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-accent-cyan text-xl">🛡️</span>
          <span className="font-bold tracking-tight">CyberShield</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-slate-300 p-2" aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-bg-panel border-r border-bg-border
          flex flex-col z-50 transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="hidden md:flex items-center gap-2 px-5 py-5 border-b border-bg-border">
          <span className="text-accent-cyan text-2xl">🛡️</span>
          <div>
            <p className="font-bold tracking-tight leading-none">CyberShield</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              {mode === 'admin' ? 'Admin Console' : 'Threat Detection'}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-bg-card border border-transparent'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-bg-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent-red hover:bg-accent-red/10 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
