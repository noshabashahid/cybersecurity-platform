import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import RiskBadge from '../../components/RiskBadge';
import api, { extractErrorMessage } from '../../services/api';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'phishing_email', label: 'Phishing Email' },
  { value: 'message', label: 'Message' },
  { value: 'url', label: 'URL' },
  { value: 'screenshot', label: 'Screenshot' },
];
const LEVELS = ['', 'SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function AdminAnalyses() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 15;

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/analyses', { params: { type, riskLevel, search, page, limit } })
      .then((res) => { setRows(res.data.data); setTotal(res.data.total); })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [type, riskLevel, search, page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <DashboardLayout mode="admin">
      <h1 className="text-2xl font-bold">📈 System-Wide Analysis Records</h1>
      <p className="text-slate-500 text-sm mt-1">Every scan run across the platform, filterable and searchable.</p>

      <div className="card p-4 mt-6 flex flex-col sm:flex-row gap-3">
        <input className="input-field flex-1" placeholder="Search by user email or content…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input-field sm:w-48" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input-field sm:w-40" value={riskLevel} onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}>
          {LEVELS.map((l) => <option key={l} value={l}>{l || 'All Risk Levels'}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-accent-red mt-3">{error}</p>}

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Loader label="Loading analysis records…" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-bg-border">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Summary</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-bg-border last:border-0 hover:bg-bg-panel/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.user_name}</p>
                    <p className="text-xs text-slate-500">{r.user_email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize whitespace-nowrap">{r.analysis_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-400">{r.input_summary}</td>
                  <td className="px-4 py-3"><RiskBadge level={r.risk_level} /></td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right"><Link to={`/report/${r.id}`} className="text-accent-cyan hover:underline">View</Link></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="text-center text-slate-500 py-10">No records found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
        </div>
      )}
    </DashboardLayout>
  );
}
