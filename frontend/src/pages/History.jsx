import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import RiskBadge from '../components/RiskBadge';
import api, { extractErrorMessage } from '../services/api';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'phishing_email', label: 'Phishing Email' },
  { value: 'message', label: 'Message' },
  { value: 'url', label: 'URL' },
  { value: 'screenshot', label: 'Screenshot' },
];

export default function History() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 10;

  const load = useCallback(() => {
    setLoading(true);
    api.get('/analyses', { params: { type, search, page, limit } })
      .then((res) => { setRows(res.data.data); setTotal(res.data.total); })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [type, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis record permanently?')) return;
    try {
      await api.delete(`/analyses/${id}`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">🗂️ Scan History</h1>
      <p className="text-slate-500 text-sm mt-1">Review, search, and manage your past analyses.</p>

      <div className="card p-4 mt-6 flex flex-col sm:flex-row gap-3">
        <select className="input-field sm:w-52" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input
          className="input-field flex-1"
          placeholder="Search by content or verdict…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      <div className="card mt-4 overflow-x-auto">
        {loading ? (
          <Loader label="Loading history…" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No analyses found. Run a scan to see it here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-bg-border">
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
                  <td className="px-4 py-3 capitalize whitespace-nowrap">{r.analysis_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-400">{r.input_summary}</td>
                  <td className="px-4 py-3"><RiskBadge level={r.risk_level} /></td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to={`/report/${r.id}`} className="text-accent-cyan hover:underline mr-4">View</Link>
                    <button onClick={() => handleDelete(r.id)} className="text-accent-red hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
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
