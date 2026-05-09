import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';

const STEPS = [
  { num: '01', title: 'Data Loading', icon: '📂', color: '#0f4c81', desc: 'Load heart.csv from UCI repository. 303 samples, 13 features + 1 target.', detail: 'data_loader.py reads the CSV using pandas. Separates features (X) from target (y). Prints shape confirmation.' },
  { num: '02', title: 'Train/Test Split', icon: '✂️', color: '#7c3aed', desc: '80/20 stratified split preserving class balance across train and validation sets.', detail: 'split.py uses train_test_split with stratify=y. Random seed 42 for reproducibility. 242 train, 61 validation.' },
  { num: '03', title: 'Preprocessing', icon: '⚙️', color: '#0f766e', desc: 'StandardScaler applied to all 13 numerical features within a sklearn Pipeline.', detail: 'preprocessing.py builds a ColumnTransformer. Fitted only on training data to prevent leakage. Transforms both train and val at predict time.' },
  { num: '04', title: 'Model Training', icon: '🧠', color: '#f59e0b', desc: 'Three classifiers trained as sklearn Pipelines: 2× LogisticRegression + RandomForest.', detail: 'models.py defines unfitted estimators. train_compare.py wraps each in Pipeline([preprocessor, model]) and calls .fit(X_train, y_train).' },
  { num: '05', title: 'Evaluation', icon: '📊', color: '#06b6d4', desc: 'Accuracy, Precision, Recall, F1, AUC-ROC, MCC computed on the held-out validation set.', detail: 'evaluate.py computes full classification report plus confusion matrix. error_analysis.py identifies FP/FN patterns and feature deltas.' },
  { num: '06', title: 'Serialization', icon: '💾', color: '#10b981', desc: 'Selected pipeline saved as .joblib. Verified by loading and comparing predict_proba outputs.', detail: 'serialize.py uses joblib.dump/load. verify_serialization() calls assert_array_almost_equal on predictions. Output: LogisticRegression_C1.joblib' },
];

const RESULTS = [
  { model: 'LogisticRegression_C1', acc: '0.8033', prec: '0.8164', rec: '0.7938', f1: '0.7967', auc: '0.8690', mcc: '0.6098', selected: true },
  { model: 'LogisticRegression_C01', acc: '0.7869', prec: '0.8036', rec: '0.7760', f1: '0.7783', auc: '0.8788', mcc: '0.5789', selected: false },
  { model: 'RandomForest', acc: '0.8033', prec: '0.8280', rec: '0.7911', f1: '0.7939', auc: '0.9113', mcc: '0.6181', selected: false },
];

const Pipeline = () => {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg,#0f2840,#0f4c81)', padding: '4rem 0 3rem', color: 'white' }}>
        <div className="container text-center">
          <span style={{ background: 'rgba(255,255,255,0.12)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '1rem' }}>PFA ESE — Assignment 2</span>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>ML Pipeline</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
            End-to-end machine learning pipeline for cardiac risk classification. From raw CSV data to serialized production-ready sklearn Pipeline.
          </p>
        </div>
      </section>

      {/* Pipeline Steps */}
      <section style={{ padding: '4rem 0', background: '#f3f8fb' }}>
        <div className="container">
          <h2 className="text-center mb-2">Pipeline Steps</h2>
          <p className="text-center mb-5" style={{ color: '#6b7280' }}>Click any step to see implementation details.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '860px', margin: '0 auto' }}>
            {STEPS.map((s, i) => (
              <div key={s.num}>
                <div onClick={() => setActiveStep(activeStep === i ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', background: 'white', borderRadius: '14px', border: `1px solid ${activeStep === i ? s.color : '#d6e3ee'}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeStep === i ? `0 4px 16px ${s.color}25` : 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ background: s.color, color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{s.num}</span>
                      <span style={{ fontWeight: 700, color: '#0f2840' }}>{s.title}</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: 0, fontSize: '0.875rem' }}>{s.desc}</p>
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '1.25rem', transform: activeStep === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                </div>
                {activeStep === i && (
                  <div style={{ background: `${s.color}08`, border: `1px solid ${s.color}30`, borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '1.25rem 1.5rem 1.25rem 5rem' }}>
                    <p style={{ color: '#374151', marginBottom: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>{s.detail}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Comparison */}
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container">
          <h2 className="text-center mb-2">Model Comparison Results</h2>
          <p className="text-center mb-4" style={{ color: '#6b7280' }}>Validation set evaluation (61 samples, stratified 20% holdout).</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="table data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1 Score</th>
                  <th>AUC-ROC</th>
                  <th>MCC</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {RESULTS.map(r => (
                  <tr key={r.model} style={{ background: r.selected ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ fontWeight: 700, color: '#0f2840' }}>
                      <code style={{ fontSize: '0.8rem' }}>{r.model}</code>
                    </td>
                    <td style={{ fontWeight: 600, color: r.selected ? '#065f46' : '#374151' }}>{r.acc}</td>
                    <td>{r.prec}</td>
                    <td>{r.rec}</td>
                    <td>{r.f1}</td>
                    <td style={{ fontWeight: 600, color: '#0f4c81' }}>{r.auc}</td>
                    <td>{r.mcc}</td>
                    <td>
                      {r.selected && <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>✓ Selected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1.25rem 1.5rem', marginTop: '1.5rem' }}>
            <h6 style={{ color: '#065f46', marginBottom: '0.5rem' }}>✓ Why LogisticRegression_C1 was selected</h6>
            <p style={{ color: '#059669', marginBottom: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
              Equal accuracy to RandomForest (0.8033) with lower model complexity and better explainability — critical in clinical AI applications. The logistic coefficients provide feature-level insight that clinicians can interpret. Serializes to a compact 3KB joblib file and predicts in milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section style={{ padding: '4rem 0', background: '#f3f8fb' }}>
        <div className="container">
          <h2 className="text-center mb-2">Integration with CardioSentinel</h2>
          <p className="text-center mb-4" style={{ color: '#6b7280' }}>How the trained model powers the live backend.</p>
          <div className="row g-4">
            {[
              { step: '1', title: 'Export', desc: 'LogisticRegression_C1.joblib exported from PFA ESE outputs/ directory', icon: '📤' },
              { step: '2', title: 'Deploy', desc: 'Copied to ai-service/model/cardiac_pipeline.joblib — Flask loads on startup', icon: '🚀' },
              { step: '3', title: 'Predict', desc: 'POST /predict with 13 features → pipeline.predict_proba() → risk score', icon: '🔮' },
              { step: '4', title: 'Alert', desc: 'Backend auto-creates alert when riskScore ≥ 0.7 on telemetry records', icon: '🔔' },
            ].map(s => (
              <div className="col-md-3" key={s.step}>
                <div style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'white', borderRadius: '14px', border: '1px solid #d6e3ee', height: '100%' }}>
                  <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f4c81', color: 'white', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>{s.step}</div>
                  <h6 style={{ color: '#0f2840', marginBottom: '0.5rem' }}>{s.title}</h6>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pipeline;
