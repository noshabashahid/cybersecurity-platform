import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnalysisResultPanel from '../components/AnalysisResultPanel';
import api, { extractErrorMessage } from '../services/api';

const PLATFORMS = ['WhatsApp', 'SMS', 'Instagram', 'Facebook', 'Messenger', 'Telegram', 'Email', 'Other'];

export default function MessageAnalyzer() {
  const [platform, setPlatform] = useState('WhatsApp');
  const [messageText, setMessageText] = useState('');
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/analyze/message', { platform, messageText });
      setResult(res.data.result);
      setAnalysisId(res.data.analysisId);
    } catch (err) {
      setError(extractErrorMessage(err, 'Analysis failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">💬 Suspicious Message Analyzer</h1>
      <p className="text-slate-500 text-sm mt-1">Paste a message from WhatsApp, SMS, social media, or anywhere else.</p>

      <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-lg px-4 py-3 mt-6">
        ⚠️ Do not share passwords, OTPs, banking information, or personal information with anyone who contacts you unexpectedly.
      </div>

      <form onSubmit={handleSubmit} className="card p-6 mt-4 space-y-4">
        <div>
          <label className="label">Platform</label>
          <select className="input-field" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Message content *</label>
          <textarea required rows={7} className="input-field resize-none" value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Paste the message here…" />
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? 'Examining content…' : 'Analyze Message'}
        </button>
      </form>

      <AnalysisResultPanel result={result} analysisId={analysisId} />
    </DashboardLayout>
  );
}
