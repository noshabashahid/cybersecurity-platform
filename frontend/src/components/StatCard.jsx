import React from 'react';

export default function StatCard({ label, value, icon, accent = 'cyan', hint }) {
  const accentMap = {
    cyan: 'text-accent-cyan',
    green: 'text-accent-green',
    amber: 'text-accent-amber',
    red: 'text-accent-red',
    purple: 'text-accent-purple',
  };
  return (
    <div className="card p-5 flex items-start justify-between hover:shadow-glow transition">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-2 ${accentMap[accent]}`}>{value}</p>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
      {icon && <div className={`text-2xl ${accentMap[accent]} opacity-80`}>{icon}</div>}
    </div>
  );
}
