import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('patient');   // 'patient' | 'staff'
  const [tab, setTab] = useState('login');        // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', fullName: '', phone: '', age: '', sex: '1' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(loginForm.email, loginForm.password);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      navigate(data.user.role === 'patient' ? '/patient-portal' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.registerPatient(regForm);
      login(res.user, res.token);
      toast.success('Account created! Welcome to CardioSentinel.');
      navigate('/patient-portal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const setL = (k, v) => setLoginForm(p => ({ ...p, [k]: v }));
  const setR = (k, v) => setRegForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#edf7ff 0%,#e7fbf8 100%)' }}>
      {/* Left panel */}
      <div className="d-none d-lg-flex col-lg-5" style={{ background: 'linear-gradient(160deg,#0f2840 0%,#0f4c81 60%,#0f766e 100%)', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(20,184,166,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '3rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}></div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>CardioSentinel</span>
          </Link>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>AI-Powered Cardiac<br />Risk Monitoring</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            {mode === 'patient'
              ? 'Track your heart health, get AI-powered risk insights, and stay informed about your cardiac wellbeing.'
              : 'Clinical dashboard for cardiologists, nurses and administrators managing patient care.'}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[['80.3%', 'AI Accuracy'], ['0.869', 'AUC-ROC'], ['Real-time', 'Analysis']].map(([v, l]) => (
              <div key={l}>
                <div style={{ color: '#14b8a6', fontWeight: 800, fontSize: '1.1rem' }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '2rem' }} className="d-lg-none">
            <span style={{ fontSize: '1.5rem' }}></span>
            <span style={{ color: '#0f4c81', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>CardioSentinel</span>
          </Link>

          {/* Mode switcher */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            {[['patient', 'Patient Portal'], ['staff', 'Clinical Staff']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setTab('login'); }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: `2px solid ${mode === m ? '#0f4c81' : '#d6e3ee'}`, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: mode === m ? '#0f4c81' : 'white', color: mode === m ? 'white' : '#6b7280', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>

          {mode === 'patient' ? (
            <>
              <h3 style={{ color: '#0f2840', marginBottom: '0.4rem' }}>{tab === 'login' ? 'Welcome back' : 'Create your account'}</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {tab === 'login' ? 'Sign in to view your heart health dashboard.' : 'Register to track your cardiac risk with AI.'}
              </p>

              {/* Patient tabs */}
              <div style={{ display: 'flex', background: '#f3f8fb', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
                {[['login', 'Sign In'], ['register', 'Register']].map(([t, l]) => (
                  <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', background: tab === t ? 'white' : 'transparent', color: tab === t ? '#0f4c81' : '#6b7280', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                    {l}
                  </button>
                ))}
              </div>

              {tab === 'login' && (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="you@email.com" value={loginForm.email} onChange={e => setL('email', e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" value={loginForm.password} onChange={e => setL('password', e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary-brand w-100" disabled={loading} style={{ borderRadius: '10px', padding: '0.85rem' }}>
                    {loading ? 'Signing in...' : 'Sign In ->'}
                  </button>
                </form>
              )}

              {tab === 'register' && (
                <form onSubmit={handleRegister}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" placeholder="Jane Smith" value={regForm.fullName} onChange={e => setR('fullName', e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-control" placeholder="jsmith" value={regForm.username} onChange={e => setR('username', e.target.value)} required minLength={3} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Phone (optional)</label>
                      <input type="tel" className="form-control" placeholder="+1 234 567 890" value={regForm.phone} onChange={e => setR('phone', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" placeholder="you@email.com" value={regForm.email} onChange={e => setR('email', e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" placeholder="Min. 6 characters" value={regForm.password} onChange={e => setR('password', e.target.value)} required minLength={6} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Age</label>
                      <input type="number" className="form-control" placeholder="45" min={1} max={120} value={regForm.age} onChange={e => setR('age', e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Biological Sex</label>
                      <select className="form-select" value={regForm.sex} onChange={e => setR('sex', e.target.value)}>
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary-brand w-100 mt-4" disabled={loading} style={{ borderRadius: '10px', padding: '0.85rem' }}>
                    {loading ? 'Creating account...' : 'Create Account ->'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem', marginBottom: 0 }}>
                    You can add detailed clinical values after registration.
                  </p>
                </form>
              )}
            </>
          ) : (
            <>
              <h3 style={{ color: '#0f2840', marginBottom: '0.4rem' }}>Clinical Staff Sign In</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Staff accounts are provisioned by your administrator.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#92400e' }}>
                Don't have an account? Contact your clinic administrator to create one.
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="doctor@hospital.com" value={loginForm.email} onChange={e => setL('email', e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" value={loginForm.password} onChange={e => setL('password', e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary-brand w-100" disabled={loading} style={{ borderRadius: '10px', padding: '0.85rem' }}>
                  {loading ? 'Signing in...' : 'Sign In ->'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            By continuing you agree to our clinical data usage policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
