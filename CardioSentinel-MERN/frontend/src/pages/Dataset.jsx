import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';

const FEATURES = [
  { name: 'age', type: 'int', range: '29–77', desc: 'Age of the patient in years' },
  { name: 'sex', type: 'binary', range: '0, 1', desc: '0 = Female, 1 = Male' },
  { name: 'cp', type: 'int', range: '0–3', desc: 'Chest pain type: 0=typical angina, 1=atypical angina, 2=non-anginal, 3=asymptomatic' },
  { name: 'trestbps', type: 'int', range: '94–200', desc: 'Resting blood pressure (mmHg) on hospital admission' },
  { name: 'chol', type: 'int', range: '126–564', desc: 'Serum cholesterol in mg/dl' },
  { name: 'fbs', type: 'binary', range: '0, 1', desc: 'Fasting blood sugar > 120 mg/dl: 0=No, 1=Yes' },
  { name: 'restecg', type: 'int', range: '0–2', desc: 'Resting ECG: 0=normal, 1=ST-T abnormality, 2=LV hypertrophy' },
  { name: 'thalach', type: 'int', range: '71–202', desc: 'Maximum heart rate achieved (bpm)' },
  { name: 'exang', type: 'binary', range: '0, 1', desc: 'Exercise induced angina: 0=No, 1=Yes' },
  { name: 'oldpeak', type: 'float', range: '0–6.2', desc: 'ST depression induced by exercise relative to rest' },
  { name: 'slope', type: 'int', range: '0–2', desc: 'Slope of peak exercise ST segment: 0=upsloping, 1=flat, 2=downsloping' },
  { name: 'ca', type: 'int', range: '0–3', desc: 'Number of major vessels colored by fluoroscopy (0–3)' },
  { name: 'thal', type: 'int', range: '1–3', desc: 'Thalassemia: 1=normal, 2=fixed defect, 3=reversible defect' },
  { name: 'target', type: 'binary', range: '0, 1', desc: 'Heart disease: 0=absent (no disease), 1=present' },
];

const SAMPLES = [
  [63,1,3,145,233,1,0,150,0,2.3,0,0,1,1],
  [37,1,2,130,250,0,1,187,0,3.5,0,0,2,1],
  [41,0,1,130,204,0,0,172,0,1.4,2,0,2,1],
  [56,1,1,120,236,0,1,178,0,0.8,2,0,2,1],
  [57,0,0,120,354,0,1,163,1,0.6,2,0,2,1],
  [57,1,0,140,192,0,1,148,0,0.4,1,0,1,0],
  [56,0,1,140,294,0,2,153,0,1.3,1,0,2,0],
  [44,1,1,120,263,0,1,173,0,0.0,2,0,3,1],
  [52,1,2,172,199,1,1,162,0,0.5,2,0,3,1],
  [57,1,2,150,168,0,1,174,0,1.6,2,0,2,1],
];

const FEAT_NAMES = FEATURES.map(f => f.name);

const Dataset = () => {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg,#0f2840,#0f766e)', padding: '4rem 0 3rem', color: 'white' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '1rem' }}>UCI Heart Disease Dataset</span>
              <h1 style={{ color: 'white', marginBottom: '1rem' }}>Heart Disease Dataset</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                The Cleveland Heart Disease dataset from the UCI Machine Learning Repository. Contains 303 patient records with 13 clinical features used to predict heart disease presence.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="row g-3">
                {[['303', 'Patient Records'], ['13', 'Input Features'], ['2', 'Target Classes'], ['80.3%', 'Model Accuracy']].map(([v, l]) => (
                  <div className="col-6" key={l}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#14b8a6' }}>{v}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ background: 'white', padding: '3rem 0 4rem' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f3f8fb', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
            {[['features', 'Feature Descriptions'], ['samples', 'Sample Data'], ['distribution', 'Class Distribution']].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === t ? 'white' : 'transparent', color: activeTab === t ? '#0f4c81' : '#6b7280', boxShadow: activeTab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Feature Descriptions Table */}
          {activeTab === 'features' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table data-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Type</th>
                    <th>Range</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map(f => (
                    <tr key={f.name}>
                      <td><code style={{ background: '#f3f8fb', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#0f4c81', fontWeight: 700 }}>{f.name}</code></td>
                      <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{f.type}</span></td>
                      <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>{f.range}</td>
                      <td style={{ color: '#374151', fontSize: '0.875rem' }}>{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sample Data */}
          {activeTab === 'samples' && (
            <div style={{ overflowX: 'auto' }}>
              <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>First 10 records from the UCI Heart Disease dataset (Cleveland subset).</p>
              <table className="table data-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    {FEAT_NAMES.map(f => <th key={f}>{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLES.map((row, i) => (
                    <tr key={i}>
                      <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                      {row.map((v, j) => (
                        <td key={j} style={{ color: FEAT_NAMES[j] === 'target' ? (v === 1 ? '#991b1b' : '#065f46') : '#374151', fontWeight: FEAT_NAMES[j] === 'target' ? 700 : 400 }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>Target: <span style={{ color: '#991b1b', fontWeight: 600 }}>1 = heart disease present</span>, <span style={{ color: '#065f46', fontWeight: 600 }}>0 = no disease</span></p>
            </div>
          )}

          {/* Class Distribution */}
          {activeTab === 'distribution' && (
            <div className="row g-4">
              <div className="col-md-6">
                <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '14px', border: '1px solid #d6e3ee' }}>
                  <h5 style={{ color: '#0f2840', marginBottom: '1.5rem' }}>Class Balance</h5>
                  {[{ label: 'No Heart Disease (0)', count: 138, pct: 45.5, color: '#10b981' }, { label: 'Heart Disease (1)', count: 165, pct: 54.5, color: '#ef4444' }].map(c => (
                    <div key={c.label} style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{c.label}</span>
                        <span style={{ color: c.color, fontWeight: 700 }}>{c.count} ({c.pct}%)</span>
                      </div>
                      <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: '5px', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem', marginBottom: 0 }}>The dataset is approximately balanced with a slight majority of positive cases — good for training without significant resampling.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '14px', border: '1px solid #d6e3ee' }}>
                  <h5 style={{ color: '#0f2840', marginBottom: '1.5rem' }}>Key Statistics</h5>
                  {[
                    ['Total Records', '303'],
                    ['Train Split (80%)', '242 records'],
                    ['Validation (20%)', '61 records'],
                    ['Stratified Split', 'Yes'],
                    ['Missing Values', 'None (cleaned)'],
                    ['Scaling', 'StandardScaler'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{k}</span>
                      <span style={{ color: '#0f4c81', fontWeight: 700, fontSize: '0.875rem' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Dataset;
