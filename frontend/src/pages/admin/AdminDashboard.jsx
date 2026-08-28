import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import api, { extractErrorMessage } from '../../services/api';

const RISK_COLORS = { SAFE: '#34d399', LOW: '#38bdf8', MEDIUM: '#fbbf24', HIGH: '#fb923c', CRITICAL: '#f87171' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout mode="admin"><Loader label="Loading admin dashboard…" /></DashboardLayout>;

  const dailyScans = (data?.dailyScans || []).map((d) => ({ day: d.day?.slice(5), count: d.count }));
  const threatDist = (data?.threatDistribution || []).map((t) => ({ name: t.risk_level, value: t.count }));

  return (
    <DashboardLayout mode="admin">
      <h1 className="text-2xl font-bold">🛡️ Admin Dashboard</h1>
      <p className="text-slate-500 text-sm mt-1">Platform-wide statistics and threat overview.</p>

      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Users" value={data?.users?.total || 0} icon="👥" accent="cyan" />
        <StatCard label="Active Users" value={data?.users?.active || 0} icon="✅" accent="green" />
        <StatCard label="Suspended Users" value={data?.users?.disabled || 0} icon="⛔" accent="red" />
        <StatCard label="Total Scans" value={data?.scans?.total_scans || 0} icon="📊" accent="purple" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard label="Phishing Attempts" value={data?.scans?.phishing || 0} icon="📧" accent="amber" />
        <StatCard label="Suspicious URLs" value={data?.scans?.urls || 0} icon="🔗" accent="amber" />
        <StatCard label="Screenshot Threats" value={data?.scans?.screenshots || 0} icon="🖼️" accent="amber" />
        <StatCard label="Message Threats" value={data?.scans?.messages || 0} icon="💬" accent="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Daily Scans (14 days)</h3>
          {dailyScans.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyScans}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2836" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#131a28', border: '1px solid #1e2836', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-500 py-16 text-center">No scan activity yet.</p>}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Threat Distribution</h3>
          {threatDist.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={threatDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {threatDist.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#131a28', border: '1px solid #1e2836', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-500 py-16 text-center">No data yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
