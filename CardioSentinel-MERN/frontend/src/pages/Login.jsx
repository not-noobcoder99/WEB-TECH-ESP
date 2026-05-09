import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'clinician', department: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(loginForm.email, loginForm.password);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.register(regForm.username, regForm.email, regForm.password, regForm.fullName, regForm.role, regForm.department);
      login(data.user, data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#edf7ff 0%,#e7fbf8 100%)' }}>
      {/* Left panel */}
      <div className="d-none d-lg-flex col-lg-5" style={{ background: 'linear-gradient(160deg,#0f2840 0%,#0f4c81 60%,#0f766e 100%)', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(20,184,166,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '3rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🫀</div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>CardioSentinel</span>
          </Link>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>AI-Powered Cardiac<br />Risk Monitoring</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2.5rem' }}>Real-time vital sign analysis with machine learning predictions for clinical teams.</p>
          <img
            src="https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&q=80"
            alt="Heart monitoring"
            style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '14px', opacity: 0.85 }}
          />
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
            {[['80.3%', 'Accuracy'], ['0.869', 'AUC-ROC'], ['303', 'Records']].map(([v, l]) => (
              <div key={l}>
                <div style={{ color: '#14b8a6', fontWeight: 800, fontSize: '1.2rem' }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '2rem' }} className="d-lg-none">
            <span style={{ fontSize: '1.5rem' }}>🫀</span>
            <span style={{ color: '#0f4c81', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>CardioSentinel</span>
          </Link>

          <h3 style={{ color: '#0f2840', marginBottom: '0.5rem' }}>{tab === 'login' ? 'Welcome back' : 'Create account'}</h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{tab === 'login' ? 'Sign in to your clinical dashboard' : 'Join the CardioSentinel platform'}</p>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f3f8fb', borderRadius: '10px', padding: '4px', marginBottom: '1.75rem' }}>
            {[['login', 'Sign In'], ['register', 'Register']].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? 'white' : 'transparent', color: tab === t ? '#0f4c81' : '#6b7280', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="doctor@hospital.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
              </div>
              <div className="mb-4">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary-brand w-100" disabled={loading} style={{ borderRadius: '10px', padding: '0.85rem', fontSize: '1rem' }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" placeholder="Dr. Jane Smith" value={regForm.fullName} onChange={e => setRegForm({ ...regForm, fullName: e.target.value })} required />
                </div>
                <div className="col-6">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" placeholder="jsmith" value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="doctor@hospital.com" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" placeholder="Min. 6 characters" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required minLength={6} />
                </div>
                <div className="col-6">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={regForm.role} onChange={e => setRegForm({ ...regForm, role: e.target.value })}>
                    <option value="clinician">Clinician</option>
                    <option value="nurse">Nurse</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" placeholder="Cardiology" value={regForm.department} onChange={e => setRegForm({ ...regForm, department: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary-brand w-100 mt-4" disabled={loading} style={{ borderRadius: '10px', padding: '0.85rem', fontSize: '1rem' }}>
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            By continuing you agree to our clinical data usage policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
