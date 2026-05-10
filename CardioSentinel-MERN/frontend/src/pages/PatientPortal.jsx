import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import ChatBot from '../components/UI/ChatBot';

const FEATURES = [
  { key: 'age',      label: 'Age',                    unit: 'years',   min: 1,   max: 120, step: 1,    hint: 'Your age' },
  { key: 'sex',      label: 'Biological Sex',          unit: '',        min: 0,   max: 1,   step: 1,    hint: '1 = Male, 0 = Female', select: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
  { key: 'cp',       label: 'Chest Pain Type',         unit: '',        min: 0,   max: 3,   step: 1,    hint: '0=Typical angina, 1=Atypical, 2=Non-anginal, 3=Asymptomatic', select: [{ value: '0', label: 'Typical Angina' }, { value: '1', label: 'Atypical Angina' }, { value: '2', label: 'Non-Anginal Pain' }, { value: '3', label: 'Asymptomatic' }] },
  { key: 'trestbps', label: 'Resting Blood Pressure',  unit: 'mmHg',   min: 80,  max: 250, step: 1,    hint: 'Measured at rest' },
  { key: 'chol',     label: 'Serum Cholesterol',       unit: 'mg/dL',  min: 100, max: 600, step: 1,    hint: 'Total cholesterol level' },
  { key: 'fbs',      label: 'Fasting Blood Sugar',     unit: '',        min: 0,   max: 1,   step: 1,    hint: '> 120 mg/dL?', select: [{ value: '0', label: 'No (≤ 120 mg/dL)' }, { value: '1', label: 'Yes (> 120 mg/dL)' }] },
  { key: 'restecg',  label: 'Resting ECG Results',     unit: '',        min: 0,   max: 2,   step: 1,    hint: '0=Normal, 1=ST-T abnormality, 2=LVH', select: [{ value: '0', label: 'Normal' }, { value: '1', label: 'ST-T Wave Abnormality' }, { value: '2', label: 'Left Ventricular Hypertrophy' }] },
  { key: 'thalach',  label: 'Max Heart Rate Achieved', unit: 'bpm',    min: 60,  max: 220, step: 1,    hint: 'Peak heart rate during exercise' },
  { key: 'exang',    label: 'Exercise-Induced Angina', unit: '',        min: 0,   max: 1,   step: 1,    hint: 'Chest pain during exercise?', select: [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }] },
  { key: 'oldpeak',  label: 'ST Depression',           unit: 'mm',     min: 0,   max: 10,  step: 0.1,  hint: 'ST depression induced by exercise relative to rest' },
  { key: 'slope',    label: 'ST Slope',                unit: '',        min: 0,   max: 2,   step: 1,    hint: '0=Upsloping, 1=Flat, 2=Downsloping', select: [{ value: '0', label: 'Upsloping' }, { value: '1', label: 'Flat' }, { value: '2', label: 'Downsloping' }] },
  { key: 'ca',       label: 'Major Vessels (Fluoroscopy)', unit: '',    min: 0,   max: 4,   step: 1,    hint: 'Number of major vessels colored by fluoroscopy (0-4)', select: [{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
  { key: 'thal',     label: 'Thalassemia',             unit: '',        min: 0,   max: 3,   step: 1,    hint: '1=Normal, 2=Fixed defect, 3=Reversable defect', select: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Fixed Defect' }, { value: '3', label: 'Reversable Defect' }] },
];

const RISK_COLOR = { low: '#10b981', medium: '#f59e0b', moderate: '#f59e0b', high: '#ef4444' };
const RISK_BG = { low: '#d1fae5', medium: '#fef3c7', moderate: '#fef3c7', high: '#fee2e2' };

const defaultForm = () => Object.fromEntries(FEATURES.map(f => [f.key, f.select ? f.select[0].value : '']));

const PatientPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [lastResult, setLastResult] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, h, a] = await Promise.all([
        apiClient.get('/api/patient-portal/me'),
        apiClient.get('/api/patient-portal/history'),
        apiClient.get('/api/patient-portal/alerts'),
      ]);
      setProfile(p.data);
      setHistory(h.data || []);
      setAlerts(a.data || []);

      // Pre-fill form from latest report or patient baseline
      const baseline = p.data?.patient;
      if (baseline) {
        setForm(prev => {
          const filled = { ...prev };
          FEATURES.forEach(f => {
            const val = baseline[f.key];
            if (val !== undefined && val !== null && val !== '') {
              filled[f.key] = String(val);
            }
          });
          return filled;
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Patient record not found. Please contact your clinic.');
      } else {
        toast.error('Failed to load portal data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLastResult(null);
    try {
      const payload = Object.fromEntries(FEATURES.map(f => [f.key, form[f.key]]));
      const res = await apiClient.post('/api/patient-portal/reading', payload);
      setLastResult(res.data);
      toast.success('Results submitted. AI assessment complete.');
      await loadData();
      setTab('overview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogout = () => { logout(); navigate('/login'); };

  // ───── Render helpers ─────

  const RiskBadge = ({ level, score }) => (
    <span style={{ background: RISK_BG[level] || '#f3f4f6', color: RISK_COLOR[level] || '#6b7280', padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.875rem' }}>
      {level === 'high' ? '⚠ HIGH RISK' : (level === 'medium' || level === 'moderate') ? '◆ MODERATE' : '✓ LOW RISK'}
      {score !== undefined && ` — ${(score * 100).toFixed(0)}%`}
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7ff' }}>

      {/* Topbar */}
      <nav style={{ background: 'linear-gradient(90deg,#0f2840,#0f4c81)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🫀</span>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-serif, serif)' }}>CardioSentinel</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>Patient Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
            {user?.fullName || user?.username}
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Risk summary card */}
        {profile?.patient && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.5rem', boxShadow: '0 2px 16px rgba(15,76,129,0.08)', borderLeft: `5px solid ${RISK_COLOR[profile.patient.riskLevel] || '#d6e3ee'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {profile.patient.lastRiskScore != null && (
                  <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                    <CircularProgressbar
                      value={profile.patient.lastRiskScore * 100}
                      text={`${(profile.patient.lastRiskScore * 100).toFixed(0)}%`}
                      styles={buildStyles({
                        pathColor: RISK_COLOR[profile.patient.riskLevel] || '#10b981',
                        textColor: RISK_COLOR[profile.patient.riskLevel] || '#10b981',
                        trailColor: '#f3f4f6',
                        textSize: '22px',
                      })}
                    />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Your Current Risk Status</div>
                  <RiskBadge level={profile.patient.riskLevel || 'low'} score={profile.patient.lastRiskScore} />
                  {profile.patient.lastUpdated && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.35rem' }}>Last updated {new Date(profile.patient.lastUpdated).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
              <button onClick={() => setTab('submit')} style={{ background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                Submit New Reading →
              </button>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {[['overview', '📋 Overview'], ['submit', '📝 Submit Results'], ['history', '📈 History'], ['alerts', '🔔 Alerts']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '0.6rem 1.1rem', borderRadius: '9px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? '#0f4c81' : 'transparent', color: tab === t ? 'white' : '#6b7280' }}>
              {l}
              {t === 'alerts' && alerts.filter(a => a.status !== 'resolved').length > 0 && (
                <span style={{ marginLeft: '0.4rem', background: '#ef4444', color: 'white', borderRadius: '10px', padding: '0.05rem 0.45rem', fontSize: '0.7rem', fontWeight: 800 }}>
                  {alerts.filter(a => a.status !== 'resolved').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div>Loading your health data…</div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="row g-4">
                {/* Latest result banner */}
                {lastResult && (
                  <div className="col-12">
                    <div style={{ background: RISK_BG[lastResult.prediction?.riskLevel] || '#f3f4f6', border: `1px solid ${RISK_COLOR[lastResult.prediction?.riskLevel] || '#d1d5db'}`, borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f2840', marginBottom: '0.3rem' }}>Latest Assessment Result</div>
                      <RiskBadge level={lastResult.prediction?.riskLevel} score={lastResult.prediction?.riskScore} />
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Confidence: {lastResult.prediction?.confidence ? `${(lastResult.prediction.confidence * 100).toFixed(1)}%` : '—'}
                        {lastResult.prediction?.triggeredAlert && ' · ⚠ A clinical alert has been raised for review.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical profile */}
                <div className="col-md-6">
                  <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h6 style={{ color: '#0f2840', fontWeight: 700, marginBottom: '1.25rem' }}>Your Clinical Profile</h6>
                    {profile?.patient ? (
                      <div>
                        {[
                          ['Age', profile.patient.age ? `${profile.patient.age} years` : '—'],
                          ['Sex', profile.patient.sex === 1 ? 'Male' : profile.patient.sex === 0 ? 'Female' : '—'],
                          ['Resting BP', profile.patient.trestbps ? `${profile.patient.trestbps} mmHg` : '—'],
                          ['Cholesterol', profile.patient.chol ? `${profile.patient.chol} mg/dL` : '—'],
                          ['Max Heart Rate', profile.patient.thalach ? `${profile.patient.thalach} bpm` : '—'],
                          ['Risk Score', profile.patient.lastRiskScore != null ? `${(profile.patient.lastRiskScore * 100).toFixed(0)}%` : '—'],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                            <span style={{ color: '#6b7280' }}>{k}</span>
                            <span style={{ fontWeight: 600, color: '#0f2840' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No clinical data yet. Submit your first reading to see your profile.</p>
                    )}
                  </div>
                </div>

                {/* About */}
                <div className="col-md-6">
                  <div style={{ background: 'linear-gradient(135deg,#0f2840,#0f4c81)', borderRadius: '14px', padding: '1.5rem', color: 'white' }}>
                    <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>About Your Risk Score</h6>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                      Your cardiac risk score is calculated by an AI model trained on clinical data.
                      It ranges from 0–100%, where higher values indicate greater likelihood of cardiac disease.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      {[['Low', '< 40%', '#10b981'], ['Medium', '40–70%', '#f59e0b'], ['High', '> 70%', '#ef4444']].map(([l, r, c]) => (
                        <div key={l} style={{ textAlign: 'center' }}>
                          <div style={{ color: c, fontWeight: 800, fontSize: '0.85rem' }}>{l}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{r}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem 1.25rem', marginTop: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
                    ⚠ This tool is for informational purposes only. Always consult a qualified cardiologist for medical decisions.
                  </div>
                </div>

                {/* Recent submissions */}
                {history.length > 0 && (
                  <div className="col-12">
                    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <h6 style={{ color: '#0f2840', fontWeight: 700, marginBottom: '1rem' }}>Recent Submissions</h6>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {history.slice(0, 3).map(r => (
                          <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '10px', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{new Date(r.createdAt).toLocaleString()}</span>
                            <RiskBadge level={r.aiPrediction?.riskLevel} score={r.aiPrediction?.riskScore} />
                          </div>
                        ))}
                      </div>
                      {history.length > 3 && (
                        <button onClick={() => setTab('history')} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#0f4c81', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                          View all {history.length} submissions →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SUBMIT RESULTS ── */}
            {tab === 'submit' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <h5 style={{ color: '#0f2840', marginBottom: '0.4rem', fontWeight: 700 }}>Submit Clinical Reading</h5>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                  Enter your latest clinical values. These will be assessed by our AI model instantly.
                  Values are pre-filled from your last submission if available.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {FEATURES.map(f => (
                      <div className={`col-sm-6 ${['trestbps', 'chol', 'thalach', 'oldpeak'].includes(f.key) ? 'col-lg-4' : 'col-lg-6'}`} key={f.key}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                          {f.label}
                          {f.unit && <span style={{ color: '#9ca3af', fontWeight: 400 }}> ({f.unit})</span>}
                        </label>
                        {f.select ? (
                          <select className="form-select form-select-sm" value={form[f.key]} onChange={e => setF(f.key, e.target.value)} required>
                            {f.select.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        ) : (
                          <input type="number" className="form-control form-control-sm" value={form[f.key]} onChange={e => setF(f.key, e.target.value)} min={f.min} max={f.max} step={f.step} required placeholder={f.hint} />
                        )}
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>{f.hint}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" disabled={submitting} style={{ flex: 1, background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? 'Analyzing…' : 'Submit & Get AI Assessment →'}
                    </button>
                    <button type="button" onClick={() => setTab('overview')} style={{ padding: '0.9rem 1.5rem', background: '#f3f8fb', border: '1px solid #d6e3ee', borderRadius: '10px', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── HISTORY ── */}
            {tab === 'history' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h6 style={{ color: '#0f2840', fontWeight: 700, marginBottom: '1.25rem' }}>Submission History</h6>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                    <div>No submissions yet. Submit your first reading to get started.</div>
                    <button onClick={() => setTab('submit')} style={{ marginTop: '1rem', background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.65rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>
                      Submit Reading
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((r, i) => (
                      <div key={r._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', background: i === 0 ? '#f8faff' : 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f2840', fontSize: '0.875rem' }}>
                              {new Date(r.createdAt).toLocaleString()}
                              {i === 0 && <span style={{ marginLeft: '0.5rem', background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '8px', fontWeight: 700 }}>Latest</span>}
                            </div>
                          </div>
                          <RiskBadge level={r.aiPrediction?.riskLevel} score={r.aiPrediction?.riskScore} />
                        </div>
                        <div className="row g-2">
                          {[['BP', `${r.features?.trestbps} mmHg`], ['Cholesterol', `${r.features?.chol} mg/dL`], ['Max HR', `${r.features?.thalach} bpm`], ['Confidence', r.aiPrediction?.confidence ? `${(r.aiPrediction.confidence * 100).toFixed(1)}%` : '—']].map(([k, v]) => (
                            <div className="col-6 col-md-3" key={k}>
                              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                                <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '0.1rem' }}>{k}</div>
                                <div style={{ fontWeight: 700, color: '#0f2840' }}>{v}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {r.aiPrediction?.triggeredAlert && (
                          <div style={{ marginTop: '0.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#991b1b', fontWeight: 600 }}>
                            ⚠ This submission triggered a clinical alert for review.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ALERTS ── */}
            {tab === 'alerts' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h6 style={{ color: '#0f2840', fontWeight: 700, marginBottom: '1.25rem' }}>Your Clinical Alerts</h6>
                <p style={{ color: '#6b7280', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                  These alerts were raised by our AI system and reviewed by the clinical team.
                </p>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                    <div>No alerts on record. That's good news!</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {alerts.map(a => (
                      <div key={a._id} style={{ border: `1px solid ${a.status === 'resolved' ? '#d1fae5' : '#fca5a5'}`, borderRadius: '12px', padding: '1.25rem', background: a.status === 'resolved' ? '#f0fdf4' : '#fff8f8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: a.alertType === 'urgent' ? '#dc2626' : '#f59e0b', textTransform: 'uppercase' }}>
                            {a.alertType === 'urgent' ? '🚨 Urgent' : '⚠ Warning'}
                          </span>
                          <span style={{ background: a.status === 'resolved' ? '#d1fae5' : '#fee2e2', color: a.status === 'resolved' ? '#065f46' : '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            {a.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                          Risk Score: <strong style={{ color: '#0f2840' }}>{a.riskScore != null ? `${(a.riskScore * 100).toFixed(0)}%` : '—'}</strong>
                        </div>
                        {a.recommendation && (
                          <div style={{ fontSize: '0.82rem', color: '#374151', fontStyle: 'italic' }}>"{a.recommendation}"</div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>{new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

export default PatientPortal;
