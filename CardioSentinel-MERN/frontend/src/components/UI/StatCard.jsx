import React from 'react';

const StatCard = ({ label, value, sub, accent = '#0f4c81', icon }) => (
  <div className="content-card p-4 h-100" style={{ borderTop: `4px solid ${accent}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, color: accent, lineHeight: 1 }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.4rem' }}>{sub}</div>}
      </div>
      {icon && (
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
