import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await adminLogin(form.email, form.password);
    setLoading(false);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="text-accent-purple text-2xl">🛡️</span>
          <span className="font-bold text-lg">CyberShield Admin</span>
        </Link>

        <div className="card p-8 border-accent-purple/20">
          <h1 className="text-xl font-bold text-center">Administrator Login</h1>
          <p className="text-sm text-slate-500 text-center mt-1">Restricted access — authorized personnel only</p>

          {error && (
            <div className="mt-4 text-sm bg-accent-red/10 text-accent-red border border-accent-red/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Admin email</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@cybershield.local"
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
            <button type="submit" disabled={loading} className="w-full bg-accent-purple text-white font-semibold px-5 py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50">
              {loading ? 'Logging in…' : 'Log In as Admin'}
            </button>
          </form>
        </div>
        <p className="text-xs text-slate-600 text-center mt-4">
          <Link to="/login" className="hover:text-slate-400">← Back to user login</Link>
        </p>
      </div>
    </div>
  );
}
