import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import api, { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22d3ee', '#a78bfa', '#fbbf24', '#f87171'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard-stats')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader label="Loading dashboard…" /></DashboardLayout>;

  const totals = stats?.totals || {};
  const byDay = (stats?.byDay || []).map((d) => ({ day: d.day?.slice(5), count: d.count }));
  const byType = (stats?.byType || []).map((t) => ({ name: t.analysis_type.replace('_', ' '), value: t.count }));

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm mt-1">Here's your security activity overview.</p>
        </div>
        <Link to="/scan/phishing" className="btn-primary">+ New Scan</Link>
      </div>

      {error && <p className="text-accent-red text-sm mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Analyses" value={totals.total || 0} icon="📊" accent="cyan" />
        <StatCard label="Threats Detected" value={totals.threats || 0} icon="⚠️" accent="red" />
        <StatCard label="Safe Results" value={totals.safe || 0} icon="✅" accent="green" />
        <StatCard label="Suspicious Results" value={totals.suspicious || 0} icon="🔍" accent="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Analyses Over Time (14 days)</h3>
          {byDay.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2836" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#131a28', border: '1px solid #1e2836', borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">No scans yet — run your first analysis to see trends here.</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Threat Categories</h3>
          {byType.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {byType.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#131a28', border: '1px solid #1e2836', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-12 text-center">No data yet.</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-sm text-slate-300 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/scan/phishing', label: 'Scan Email', icon: '📧' },
            { to: '/scan/message', label: 'Analyze Message', icon: '💬' },
            { to: '/scan/url', label: 'Check URL', icon: '🔗' },
            { to: '/scan/screenshot', label: 'Upload Screenshot', icon: '🖼️' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="flex items-center gap-3 bg-bg-panel border border-bg-border rounded-lg px-4 py-3 hover:border-accent-cyan/40 transition text-sm font-medium">
              <span className="text-lg">{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
