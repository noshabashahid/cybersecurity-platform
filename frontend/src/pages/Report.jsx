import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import RiskMeter from '../components/RiskMeter';
import api, { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

function safeParse(value, fallback = []) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

export default function Report() {
  const { id } = useParams();
  const { user } = useAuth();
  const mode = user?.role === 'admin' ? 'admin' : 'user';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admins can view any user's report (via the admin-only endpoint);
    // regular users can only fetch their own via the user-scoped endpoint.
    const endpoint = mode === 'admin' ? `/admin/analyses/${id}` : `/analyses/${id}`;
    api.get(endpoint)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(extractErrorMessage(err, 'Report not found.')))
      .finally(() => setLoading(false));
  }, [id, mode]);

  const handlePrint = () => window.print();

  if (loading) return <DashboardLayout mode={mode}><Loader label="Loading report…" /></DashboardLayout>;
  if (error) return <DashboardLayout mode={mode}><p className="text-accent-red">{error}</p></DashboardLayout>;

  const indicators = safeParse(data.indicators);
  const recommendations = safeParse(data.recommendations);

  return (
    <DashboardLayout mode={mode}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <Link to="/history" className="text-sm text-slate-500 hover:text-slate-300">← Back to history</Link>
          <h1 className="text-2xl font-bold mt-1">Cybersecurity Threat Report</h1>
        </div>
        <button onClick={handlePrint} className="btn-secondary text-sm">⬇ Download / Print Report</button>
      </div>

      <div className="card p-6 md:p-8">
        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-bg-border">
          <div><span className="text-slate-500">Analysis Type: </span><span className="font-medium capitalize">{data.analysis_type.replace('_', ' ')}</span></div>
          <div><span className="text-slate-500">Date: </span><span className="font-medium">{new Date(data.created_at).toLocaleString()}</span></div>
          <div><span className="text-slate-500">Analysis Mode: </span><span className="font-medium">{data.ai_mode === 'ai' ? 'AI-Powered' : 'Automated / Demo Fallback'}</span></div>
          <div><span className="text-slate-500">Report ID: </span><span className="font-medium">#{data.id}</span></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <RiskMeter score={data.risk_score} level={data.risk_level} />
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Verdict</h2>
            <p className="text-slate-400 mt-1">{data.verdict}</p>
            <h2 className="font-semibold text-lg mt-4">AI Explanation</h2>
            <p className="text-slate-400 mt-1">{data.explanation}</p>
          </div>
        </div>

        {data.stored_name && (
          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-2">Uploaded Screenshot</h2>
            <img
              src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/${data.stored_name}`}
              alt="Uploaded screenshot"
              className="max-h-96 rounded-lg border border-bg-border"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="font-semibold text-lg mb-2">Threat Indicators</h2>
            <ol className="space-y-1.5 list-decimal list-inside text-sm text-slate-400">
              {indicators.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2">Recommended Actions</h2>
            <ol className="space-y-1.5 list-decimal list-inside text-sm text-slate-400">
              {recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}