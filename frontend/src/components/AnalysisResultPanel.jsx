import React from 'react';
import { Link } from 'react-router-dom';
import RiskMeter from './RiskMeter';

export default function AnalysisResultPanel({ result, analysisId }) {
  if (!result) return null;
  const isFallback = result.aiMode === 'fallback';

  return (
    <div className="card p-6 mt-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <RiskMeter score={result.riskScore} level={result.riskLevel} />
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{result.verdict}</h3>
            {isFallback ? (
              <span className="badge bg-slate-500/10 text-slate-400 border border-slate-500/30">Automated / Demo Analysis</span>
            ) : (
              <span className="badge bg-accent-purple/10 text-accent-purple border border-accent-purple/30">AI-Powered Analysis</span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-2">{result.explanation}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Detected Indicators</h4>
          <ul className="space-y-1.5">
            {(result.threats || []).map((t, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-accent-amber mt-0.5">▲</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Recommended Actions</h4>
          <ul className="space-y-1.5">
            {(result.recommendations || []).map((r, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-accent-green mt-0.5">✓</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {analysisId && (
        <div className="mt-6 pt-4 border-t border-bg-border flex justify-end">
          <Link to={`/report/${analysisId}`} className="btn-secondary text-sm">View Full Report →</Link>
        </div>
      )}
    </div>
  );
}
