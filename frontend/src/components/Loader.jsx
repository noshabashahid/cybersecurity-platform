import React from 'react';

export default function Loader({ label = 'Loading…', full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? 'h-screen' : 'py-16'}`}>
      <div className="w-10 h-10 border-2 border-bg-border border-t-accent-cyan rounded-full animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
