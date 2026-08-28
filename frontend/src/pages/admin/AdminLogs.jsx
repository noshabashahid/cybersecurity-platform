import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import api, { extractErrorMessage } from '../../services/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/logs')
      .then((res) => setLogs(res.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout mode="admin">
      <h1 className="text-2xl font-bold">🧾 System Activity Logs</h1>
      <p className="text-slate-500 text-sm mt-1">Audit trail of admin actions across the platform.</p>

      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      <div className="card mt-6 overflow-x-auto">
        {loading ? <Loader label="Loading logs…" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-bg-border">
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-bg-border last:border-0 hover:bg-bg-panel/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{l.admin_name}</p>
                    <p className="text-xs text-slate-500">{l.admin_email}</p>
                  </td>
                  <td className="px-4 py-3">{l.action}</td>
                  <td className="px-4 py-3 text-slate-400">{l.target_type ? `${l.target_type} #${l.target_id}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!logs.length && <tr><td colSpan={4} className="text-center text-slate-500 py-10">No admin activity logged yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
