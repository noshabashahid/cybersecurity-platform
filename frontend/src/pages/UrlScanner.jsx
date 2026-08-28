import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnalysisResultPanel from '../components/AnalysisResultPanel';
import api, { extractErrorMessage } from '../services/api';

export default function UrlScanner() {
  const [url, setUrl] = useState('');
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
      const res = await api.post('/analyze/url', { url });
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
      <h1 className="text-2xl font-bold">🔗 URL Security Scanner</h1>
      <p className="text-slate-500 text-sm mt-1">
        Checks a link's structure for red flags. We never visit the URL from our servers — only safe local parsing,
        plus optional live threat-intel lookups if configured.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-4">
        <div>
          <label className="label">URL to check *</label>
          <input
            required
            type="url"
            className="input-field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/login"
          />
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? 'Scanning URL…' : 'Scan URL'}
        </button>
      </form>

      <AnalysisResultPanel result={result} analysisId={analysisId} />
    </DashboardLayout>
  );
}
