import React from 'react';

const config = {
  low:      { bg: '#d1fae5', color: '#065f46', dot: '#10b981', label: 'Low Risk' },
  moderate: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Moderate Risk' },
  high:     { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', label: 'High Risk' },
};

const RiskBadge = ({ level, showDot = true, size = 'md' }) => {
  const c = config[level] || config.moderate;
  const pad = size === 'sm' ? '0.2rem 0.6rem' : '0.35rem 0.85rem';
  const fs = size === 'sm' ? '0.75rem' : '0.85rem';

  return (
    <span style={{ background: c.bg, color: c.color, padding: pad, borderRadius: '20px', fontWeight: 700, fontSize: fs, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
      {showDot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.dot, display: 'inline-block' }} />}
      {c.label}
    </span>
  );
};

export default RiskBadge;
