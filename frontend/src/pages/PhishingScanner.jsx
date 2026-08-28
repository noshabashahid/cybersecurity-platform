import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnalysisResultPanel from '../components/AnalysisResultPanel';
import api, { extractErrorMessage } from '../services/api';

export default function PhishingScanner() {
  const [form, setForm] = useState({ senderEmail: '', recipientEmail: '', subject: '', body: '', suspiciousUrl: '' });
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
      const res = await api.post('/analyze/phishing', form);
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
      <h1 className="text-2xl font-bold">📧 Phishing Email Scanner</h1>
      <p className="text-slate-500 text-sm mt-1">Paste in a suspicious email's details to check for phishing indicators.</p>

      <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Sender email *</label>
            <input required type="email" className="input-field" value={form.senderEmail}
              onChange={(e) => setForm({ ...form, senderEmail: e.target.value })} placeholder="support@paypa1.com" />
          </div>
          <div>
            <label className="label">Recipient email (optional)</label>
            <input type="email" className="input-field" value={form.recipientEmail}
              onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="label">Subject *</label>
          <input required className="input-field" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Urgent: Verify your account now" />
        </div>
        <div>
          <label className="label">Email body *</label>
          <textarea required rows={7} className="input-field resize-none" value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Paste the full email content here…" />
        </div>
        <div>
          <label className="label">Suspicious URL (optional)</label>
          <input type="url" className="input-field" value={form.suspiciousUrl}
            onChange={(e) => setForm({ ...form, suspiciousUrl: e.target.value })} placeholder="https://…" />
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? 'Analyzing threat indicators…' : 'Analyze Email'}
        </button>
      </form>

      <AnalysisResultPanel result={result} analysisId={analysisId} />
    </DashboardLayout>
  );
}
