import React from 'react';

const STYLES = {
  SAFE: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  LOW: 'bg-sky-400/10 text-sky-400 border-sky-400/30',
  MEDIUM: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
  HIGH: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
  CRITICAL: 'bg-accent-red/10 text-accent-red border-accent-red/30',
};

export default function RiskBadge({ level }) {
  return (
    <span className={`badge border ${STYLES[level] || STYLES.SAFE}`}>
      {level}
    </span>
  );
}
