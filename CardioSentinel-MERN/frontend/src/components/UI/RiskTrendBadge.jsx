import React from 'react';

const RiskTrendBadge = ({ predictions = [] }) => {
  if (!predictions || predictions.length === 0) return null;

  if (predictions.length === 1) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#3b82f6', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
        ★ New
      </span>
    );
  }

  const last5 = predictions.slice(-5).map(p => p.riskScore);
  const n = last5.length;
  const xMean = (n - 1) / 2;
  const yMean = last5.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  last5.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
  const slope = den === 0 ? 0 : num / den;

  let label, color, bg, arrow;
  if (slope > 0.015) {
    label = 'Worsening'; color = '#dc2626'; bg = '#fee2e2'; arrow = '↑';
  } else if (slope < -0.015) {
    label = 'Improving'; color = '#059669'; bg = '#d1fae5'; arrow = '↓';
  } else {
    label = 'Stable'; color = '#6b7280'; bg = '#f3f4f6'; arrow = '→';
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: bg, color, padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
      {arrow} {label}
    </span>
  );
};

export default RiskTrendBadge;
