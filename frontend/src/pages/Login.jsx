import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      // Admin accounts logging in through the regular user login page
      // should still land on the admin dashboard, not the user one.
      navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="text-accent-cyan text-2xl">🛡️</span>
          <span className="font-bold text-lg">CyberShield</span>
        </Link>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-center">Welcome back</h1>
          <p className="text-sm text-slate-500 text-center mt-1">Log in to your security dashboard</p>

          {params.get('expired') && (
            <div className="mt-4 text-sm bg-accent-amber/10 text-accent-amber border border-accent-amber/30 rounded-lg px-3 py-2">
              Your session expired. Please log in again.
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm bg-accent-red/10 text-accent-red border border-accent-red/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-cyan hover:underline">Sign up</Link>
          </p>
        </div>
        <p className="text-xs text-slate-600 text-center mt-4">
          <Link to="/admin/login" className="hover:text-slate-400">Administrator login →</Link>
        </p>
      </div>
    </div>
  );
}