import React, { useRef, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnalysisResultPanel from '../components/AnalysisResultPanel';
import api, { extractErrorMessage } from '../services/api';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_MB = 5;

export default function ScreenshotAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    setError('');
    setResult(null);
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Unsupported image type. Please use PNG, JPG, JPEG, or WEBP.');
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image too large. Maximum size is ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      const res = await api.post('/analyze/screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
      <h1 className="text-2xl font-bold">🖼️ AI Screenshot Analyzer</h1>
      <p className="text-slate-500 text-sm mt-1">Upload a screenshot of a suspicious email, login page, or message.</p>

      <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          className="border-2 border-dashed border-bg-border rounded-xl p-8 text-center cursor-pointer hover:border-accent-cyan/50 transition"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-72 mx-auto rounded-lg" />
          ) : (
            <div className="text-slate-500">
              <div className="text-4xl mb-2">📁</div>
              <p className="font-medium text-slate-300">Click to upload or drag & drop</p>
              <p className="text-xs mt-1">PNG, JPG, JPEG, WEBP — up to {MAX_MB}MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <button type="submit" disabled={loading || !file} className="btn-primary w-full sm:w-auto">
          {loading ? 'Generating security assessment…' : 'Analyze Screenshot'}
        </button>
      </form>

      <AnalysisResultPanel result={result} analysisId={analysisId} />
    </DashboardLayout>
  );
}
