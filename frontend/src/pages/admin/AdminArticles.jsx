import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import api, { extractErrorMessage } from '../../services/api';

const CATEGORIES = [
  'Phishing', 'Password Security', 'Social Engineering', 'Malware', 'Ransomware',
  'Safe Browsing', 'Public Wi-Fi', 'Social Media Security', 'Account Security',
  'Email Security', 'Data Privacy', 'Mobile Security',
];

const EMPTY_FORM = {
  category: 'Phishing', title: '', description: '', threatExplanation: '',
  warningSigns: '', preventionTips: '', whatToDo: '',
};

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/articles')
      .then((res) => setArticles(res.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (a) => {
    setForm({
      category: a.category,
      title: a.title,
      description: a.description,
      threatExplanation: a.threat_explanation,
      warningSigns: a.warning_signs.join('\n'),
      preventionTips: a.prevention_tips.join('\n'),
      whatToDo: a.what_to_do,
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setSaving(true);
    const payload = {
      ...form,
      warningSigns: form.warningSigns.split('\n').map((s) => s.trim()).filter(Boolean),
      preventionTips: form.preventionTips.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/articles/${editingId}`, payload);
        setMsg('Article updated.');
      } else {
        await api.post('/articles', payload);
        setMsg('Article created.');
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await api.delete(`/articles/${id}`);
      setMsg('Article deleted.');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <DashboardLayout mode="admin">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">📝 Manage Awareness Articles</h1>
          <p className="text-slate-500 text-sm mt-1">Create, edit, and remove cybersecurity awareness content.</p>
        </div>
        <button onClick={startCreate} className="btn-primary">+ New Article</button>
      </div>

      {msg && <p className="text-sm text-accent-green mt-4">{msg}</p>}
      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mt-4 space-y-4">
          <h2 className="font-semibold">{editingId ? 'Edit Article' : 'New Article'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Short description</label>
            <input required className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Threat explanation</label>
            <textarea required rows={3} className="input-field resize-none" value={form.threatExplanation}
              onChange={(e) => setForm({ ...form, threatExplanation: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Warning signs (one per line)</label>
              <textarea required rows={4} className="input-field resize-none" value={form.warningSigns}
                onChange={(e) => setForm({ ...form, warningSigns: e.target.value })} />
            </div>
            <div>
              <label className="label">Prevention tips (one per line)</label>
              <textarea required rows={4} className="input-field resize-none" value={form.preventionTips}
                onChange={(e) => setForm({ ...form, preventionTips: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">What to do if attacked</label>
            <textarea required rows={3} className="input-field resize-none" value={form.whatToDo}
              onChange={(e) => setForm({ ...form, whatToDo: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Article'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card mt-6 overflow-x-auto">
        {loading ? <Loader label="Loading articles…" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-bg-border">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-bg-border last:border-0 hover:bg-bg-panel/50">
                  <td className="px-4 py-3">{a.title}</td>
                  <td className="px-4 py-3 text-slate-400">{a.category}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(a)} className="text-accent-cyan hover:underline mr-4">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-accent-red hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {!articles.length && <tr><td colSpan={3} className="text-center text-slate-500 py-10">No articles yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
