import React, { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { analyzePassword } from '../utils/passwordStrength';

const LABEL_COLORS = {
  'Very Weak': 'text-accent-red',
  Weak: 'text-orange-400',
  Moderate: 'text-accent-amber',
  Strong: 'text-sky-400',
  'Very Strong': 'text-accent-green',
};
const BAR_COLORS = {
  'Very Weak': 'bg-accent-red',
  Weak: 'bg-orange-400',
  Moderate: 'bg-accent-amber',
  Strong: 'bg-sky-400',
  'Very Strong': 'bg-accent-green',
};

export default function PasswordChecker() {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const result = useMemo(() => analyzePassword(pw), [pw]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">🔑 Password Security Checker</h1>
      <p className="text-slate-500 text-sm mt-1">
        Fully local — your password is analyzed in your browser and is never sent to our servers or stored anywhere.
      </p>

      <div className="card p-6 mt-6">
        <label className="label">Enter a password to check</label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            className="input-field pr-16"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Type a password…"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-400">Strength</span>
            <span className={`text-sm font-semibold ${LABEL_COLORS[result.label]}`}>{result.label}</span>
          </div>
          <div className="h-2 bg-bg-panel rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${BAR_COLORS[result.label]}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Recommendations</h4>
          <ul className="space-y-1.5">
            {result.tips.map((t, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-accent-cyan mt-0.5">•</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
