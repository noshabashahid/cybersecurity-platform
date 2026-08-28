import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import api, { extractErrorMessage } from '../../services/api';

const EMPTY_FORM = {
  category: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', explanation: '',
};

export default function AdminQuiz() {
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('questions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get('/quiz/admin/questions'), api.get('/admin/quiz-results')])
      .then(([qRes, rRes]) => { setQuestions(qRes.data.data); setResults(rRes.data.data); })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const startEdit = (q) => {
    setForm({
      category: q.category, question: q.question,
      optionA: q.option_a, optionB: q.option_b, optionC: q.option_c, optionD: q.option_d,
      correctOption: q.correct_option, explanation: q.explanation || '',
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/quiz/admin/questions/${editingId}`, form);
        setMsg('Question updated.');
      } else {
        await api.post('/quiz/admin/questions', form);
        setMsg('Question created.');
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
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await api.delete(`/quiz/admin/questions/${id}`);
      setMsg('Question deleted.');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <DashboardLayout mode="admin">
      <h1 className="text-2xl font-bold">❓ Manage Security Quiz</h1>
      <p className="text-slate-500 text-sm mt-1">Manage quiz questions and review user results.</p>

      <div className="flex gap-2 mt-6">
        <button onClick={() => setTab('questions')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'questions' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30' : 'text-slate-400 border border-transparent'}`}>Questions</button>
        <button onClick={() => setTab('results')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'results' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30' : 'text-slate-400 border border-transparent'}`}>Results</button>
      </div>

      {msg && <p className="text-sm text-accent-green mt-4">{msg}</p>}
      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      {tab === 'questions' && (
        <>
          <div className="flex justify-end mt-4">
            <button onClick={startCreate} className="btn-primary">+ New Question</button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card p-6 mt-4 space-y-4">
              <h2 className="font-semibold">{editingId ? 'Edit Question' : 'New Question'}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <input required className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="label">Correct option</label>
                  <select className="input-field" value={form.correctOption} onChange={(e) => setForm({ ...form, correctOption: e.target.value })}>
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Question</label>
                <textarea required rows={2} className="input-field resize-none" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Option A</label><input required className="input-field" value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} /></div>
                <div><label className="label">Option B</label><input required className="input-field" value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} /></div>
                <div><label className="label">Option C</label><input required className="input-field" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} /></div>
                <div><label className="label">Option D</label><input required className="input-field" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} /></div>
              </div>
              <div>
                <label className="label">Explanation (shown after answering)</label>
                <textarea rows={2} className="input-field resize-none" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Question'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="card mt-6 overflow-x-auto">
            {loading ? <Loader label="Loading questions…" /> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-bg-border">
                    <th className="px-4 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Correct</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} className="border-b border-bg-border last:border-0 hover:bg-bg-panel/50">
                      <td className="px-4 py-3 max-w-sm truncate">{q.question}</td>
                      <td className="px-4 py-3 text-slate-400">{q.category}</td>
                      <td className="px-4 py-3 uppercase">{q.correct_option}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => startEdit(q)} className="text-accent-cyan hover:underline mr-4">Edit</button>
                        <button onClick={() => handleDelete(q.id)} className="text-accent-red hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!questions.length && <tr><td colSpan={4} className="text-center text-slate-500 py-10">No questions yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'results' && (
        <div className="card mt-4 overflow-x-auto">
          {loading ? <Loader label="Loading results…" /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-bg-border">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Percentage</th>
                  <th className="px-4 py-3 font-medium">Level</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-bg-border last:border-0 hover:bg-bg-panel/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.user_name}</p>
                      <p className="text-xs text-slate-500">{r.user_email}</p>
                    </td>
                    <td className="px-4 py-3">{r.score}/{r.total_questions}</td>
                    <td className="px-4 py-3">{r.percentage}%</td>
                    <td className="px-4 py-3 text-accent-purple">{r.performance_level}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!results.length && <tr><td colSpan={5} className="text-center text-slate-500 py-10">No quiz attempts yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
