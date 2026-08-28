import React from 'react';

const LEVEL_STYLES = {
  SAFE: { color: '#34d399', bg: 'bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green/30' },
  LOW: { color: '#38bdf8', bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-400/30' },
  MEDIUM: { color: '#fbbf24', bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/30' },
  HIGH: { color: '#fb923c', bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/30' },
  CRITICAL: { color: '#f87171', bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/30' },
};

export default function RiskMeter({ score = 0, level = 'SAFE' }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.SAFE;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e2836" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={style.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: style.color }}>{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      <span className={`badge ${style.bg} ${style.text} border ${style.border}`}>
        {level} RISK
      </span>
    </div>
  );
}
