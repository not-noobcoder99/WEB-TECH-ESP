import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 40, text = 'Loading...' }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite' }}>
        <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#d6e3ee" strokeWidth="5" />
        <path d="M25 5 a20 20 0 0 1 20 20" fill="none" stroke="#0f4c81" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {text && <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f8fb' }}>
        {spinner}
      </div>
    );
  }
  return <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>{spinner}</div>;
};

export default LoadingSpinner;
