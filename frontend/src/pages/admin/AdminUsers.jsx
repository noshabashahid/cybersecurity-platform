import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import api, { extractErrorMessage } from '../../services/api';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const limit = 15;

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/users', { params: { search, status, role, page, limit } })
      .then((res) => { setRows(res.data.data); setTotal(res.data.total); })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, status, role, page]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'disabled' : 'active';
    try {
      await api.put(`/admin/users/${u.id}/status`, { status: newStatus });
      setMsg(`${u.name} is now ${newStatus}.`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Permanently delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      setMsg(`${u.name} deleted.`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <DashboardLayout mode="admin">
      <h1 className="text-2xl font-bold">👥 Manage Users</h1>
      <p className="text-slate-500 text-sm mt-1">View, search, activate, disable, or remove user accounts.</p>

      <div className="card p-4 mt-6 flex flex-col sm:flex-row gap-3">
        <input className="input-field flex-1" placeholder="Search by name or email…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input-field sm:w-40" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select className="input-field sm:w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {msg && <p className="text-sm text-accent-green mt-3">{msg}</p>}
      {error && <p className="text-sm text-accent-red mt-3">{error}</p>}

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Loader label="Loading users…" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-bg-border">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-bg-border last:border-0 hover:bg-bg-panel/50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`badge border ${u.status === 'active' ? 'bg-accent-green/10 text-accent-green border-accent-green/30' : 'bg-accent-red/10 text-accent-red border-accent-red/30'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => toggleStatus(u)} className="text-accent-cyan hover:underline mr-4">
                      {u.status === 'active' ? 'Disable' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(u)} className="text-accent-red hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="text-center text-slate-500 py-10">No users found.</td></tr>
              )}
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
