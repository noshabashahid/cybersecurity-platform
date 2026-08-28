import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import api, { extractErrorMessage } from '../services/api';

const CATEGORIES = [
  'All', 'Phishing', 'Password Security', 'Social Engineering', 'Malware', 'Ransomware',
  'Safe Browsing', 'Public Wi-Fi', 'Social Media Security', 'Account Security',
  'Email Security', 'Data Privacy', 'Mobile Security',
];

export default function Tips() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/articles', { params: category !== 'All' ? { category } : {} })
      .then((res) => setArticles(res.data.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">📚 Cybersecurity Awareness Center</h1>
      <p className="text-slate-500 text-sm mt-1">Learn how to recognize and respond to common cyber threats.</p>

      <div className="flex flex-wrap gap-2 mt-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              category === c
                ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/40'
                : 'bg-bg-panel text-slate-400 border-bg-border hover:border-slate-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-accent-red mt-4">{error}</p>}

      {loading ? (
        <Loader label="Loading articles…" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {articles.map((a) => {
            const open = expanded === a.id;
            return (
              <div key={a.id} className="card p-5">
                <span className="badge bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 mb-2">{a.category}</span>
                <h3 className="font-semibold text-slate-100">{a.title}</h3>
                <p className="text-sm text-slate-500 mt-1.5">{a.description}</p>
                <button
                  onClick={() => setExpanded(open ? null : a.id)}
                  className="text-accent-cyan text-sm font-medium mt-3 hover:underline"
                >
                  {open ? 'Show less ▲' : 'Read more ▼'}
                </button>
                {open && (
                  <div className="mt-4 pt-4 border-t border-bg-border space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">The Threat</h4>
                      <p className="text-slate-400">{a.threat_explanation}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Warning Signs</h4>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {a.warning_signs.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Prevention Tips</h4>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {a.prevention_tips.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">If You're Attacked</h4>
                      <p className="text-slate-400">{a.what_to_do}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!articles.length && <p className="text-sm text-slate-500 col-span-2 text-center py-8">No articles in this category yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
}
