import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const FEATURES = [
  {
    emoji: '🫀',
    title: 'AI Risk Assessment',
    desc: 'LogisticRegression trained on UCI Heart Disease dataset predicts cardiac risk with 80%+ accuracy and 0.87 AUC-ROC score.',
    accent: '#0f4c81',
  },
  {
    emoji: '📡',
    title: 'Real-time Telemetry',
    desc: 'Stream vital signs — heart rate, blood pressure, oxygen saturation — with every reading auto-triggering an AI prediction.',
    accent: '#0f766e',
  },
  {
    emoji: '🔔',
    title: 'Smart Alerting',
    desc: 'Automatic urgent alerts when AI risk score exceeds 0.7. Clinical staff get immediate notification for high-risk patients.',
    accent: '#dc2626',
  },
];

const STEPS = [
  { num: '01', title: 'Enroll Patient', desc: 'Register patient with clinical baseline features (age, sex, 11 clinical markers)' },
  { num: '02', title: 'Record Vitals', desc: 'Submit real-time telemetry — heart rate, BP, oxygen saturation' },
  { num: '03', title: 'AI Predicts', desc: 'LogisticRegression model generates cardiac risk score from 0 to 1' },
  { num: '04', title: 'Alert Clinician', desc: 'Automatic urgent alert raised when risk score ≥ 0.7' },
];

const TECH = ['React 18', 'Node.js', 'MongoDB', 'Flask', 'scikit-learn', 'Bootstrap 5'];

const Footer = () => (
  <footer style={{ background: '#0a1f33', color: 'rgba(255,255,255,0.6)', padding: '3rem 0 2rem' }}>
    <div className="container">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div style={{ fontFamily: 'var(--font-serif)', color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>💙 CardioSentinel</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>AI-powered remote cardiac monitoring platform built for clinical excellence and patient safety.</p>
        </div>
        <div className="col-md-2">
          <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform</div>
          {[['Home', '/'], ['Project', '/project'], ['Dataset', '/dataset'], ['Pipeline', '/pipeline']].map(([l, h]) => (
            <div key={l}><Link to={h} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', lineHeight: '2' }}>{l}</Link></div>
          ))}
        </div>
        <div className="col-md-2">
          <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Support</div>
          {[['Contact', '/contact'], ['Login', '/login']].map(([l, h]) => (
            <div key={l}><Link to={h} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', lineHeight: '2' }}>{l}</Link></div>
          ))}
        </div>
        <div className="col-md-4">
          <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model Performance</div>
          {[['Accuracy', '80.3%'], ['AUC-ROC', '0.869'], ['MCC', '0.610'], ['Dataset', '303 records']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{k}</span>
              <span style={{ color: '#14b8a6', fontWeight: 700, fontSize: '0.85rem' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
        © 2024 CardioSentinel Remote — Web Technology & AI Project
      </div>
    </div>
  </footer>
);

const Home = () => (
  <>
    <Navbar />

    {/* ── Hero ── */}
    <section style={{ padding: '5rem 0 4rem', background: 'linear-gradient(135deg, #edf7ff 0%, #e7fbf8 100%)' }}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 fade-up">
            <span style={{ display: 'inline-block', background: 'rgba(15,76,129,0.1)', color: '#0f4c81', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              🫀 AI-Powered Cardiac Monitoring
            </span>
            <h1 style={{ fontSize: '3.25rem', lineHeight: 1.15, color: '#0f2840', marginBottom: '1.5rem' }}>
              Remote Heart Risk<br />
              <span style={{ color: '#0f4c81' }}>Prediction Platform</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: 1.8, marginBottom: '2rem' }}>
              CardioSentinel integrates machine learning with real-time vital sign monitoring to identify high-risk cardiac patients before emergencies occur — built on the UCI Heart Disease dataset with clinical-grade accuracy.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <Link to="/login" className="btn btn-primary-brand btn-lg" style={{ borderRadius: '10px', padding: '0.9rem 2.25rem' }}>
                Get Started →
              </Link>
              <Link to="/project" className="btn btn-lg" style={{ border: '2px solid #0f4c81', color: '#0f4c81', borderRadius: '10px', padding: '0.9rem 2.25rem', fontWeight: 600 }}>
                Learn More
              </Link>
            </div>
            <div className="d-flex gap-4 flex-wrap">
              {[['303', 'Records Analyzed'], ['85%+', 'AI Accuracy'], ['Real-time', 'Monitoring']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f4c81' }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6 fade-up delay-1">
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
                alt="Medical monitoring dashboard"
                style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 24px 64px rgba(15,40,64,0.22)' }}
              />
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'white', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 8px 28px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f2840' }}>AI Prediction Active</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Risk Score: 0.23 — Low Risk ✓</div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#fee2e2', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#991b1b' }}>⚠️ High Risk Alert</div>
                <div style={{ fontSize: '0.7rem', color: '#b91c1c' }}>Patient CS-0047 — Score: 0.82</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Stats Bar ── */}
    <section style={{ background: '#0f2840', padding: '2.5rem 0' }}>
      <div className="container">
        <div className="row g-4 text-center">
          {[['303', 'Dataset Records'], ['80.3%', 'Model Accuracy'], ['0.869', 'AUC-ROC Score'], ['13', 'Clinical Features']].map(([v, l]) => (
            <div className="col-6 col-md-3" key={l}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#14b8a6' }}>{v}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section style={{ padding: '5rem 0', background: 'white' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2>Platform Features</h2>
          <p style={{ maxWidth: '520px', margin: '0 auto', color: '#6b7280' }}>
            Everything needed for AI-powered cardiac monitoring in a single, integrated clinical platform.
          </p>
        </div>
        <div className="row g-4">
          {FEATURES.map(f => (
            <div className="col-md-4" key={f.title}>
              <div className="content-card p-4 h-100">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.emoji}</div>
                <h4 style={{ color: f.accent, marginBottom: '0.75rem' }}>{f.title}</h4>
                <p style={{ color: '#6b7280', marginBottom: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How It Works ── */}
    <section style={{ padding: '5rem 0', background: '#f3f8fb' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2>How It Works</h2>
          <p style={{ color: '#6b7280' }}>Four steps from patient enrollment to clinical alert.</p>
        </div>
        <div className="row g-4">
          {STEPS.map((s, i) => (
            <div className="col-md-3" key={s.num}>
              <div style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #d6e3ee', height: '100%', position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: '2.5rem', right: '-1rem', color: '#d6e3ee', fontSize: '1.5rem', display: 'none' }}>→</div>
                )}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#0f4c81,#0f766e)', color: 'white', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>{s.num}</div>
                <h5 style={{ color: '#0f2840', marginBottom: '0.5rem' }}>{s.title}</h5>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Tech Stack ── */}
    <section style={{ padding: '4rem 0', background: 'white' }}>
      <div className="container text-center">
        <p style={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Built With</p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {TECH.map(t => (
            <span key={t} style={{ background: '#f3f8fb', border: '1px solid #d6e3ee', color: '#0f4c81', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}>{t}</span>
          ))}
        </div>
      </div>
    </section>

    {/* ── Image Feature Row ── */}
    <section style={{ padding: '5rem 0', background: '#f3f8fb' }}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80"
              alt="Heart monitoring equipment"
              style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 16px 40px rgba(15,40,64,0.15)' }}
            />
          </div>
          <div className="col-lg-6">
            <h2>Clinical-Grade AI Predictions</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>
              Our LogisticRegression model, trained on 303 UCI Heart Disease records with 13 clinical features, provides transparent and explainable predictions — critical for clinical environments where trust in AI matters.
            </p>
            <div className="row g-3 mt-2">
              {[['13', 'Input Features', '#0f4c81'], ['2', 'Risk Classes', '#0f766e'], ['80%+', 'Val Accuracy', '#f59e0b']].map(([v, l, c]) => (
                <div className="col-4" key={l}>
                  <div style={{ textAlign: 'center', padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #d6e3ee' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c }}>{v}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,#0f2840,#0f4c81)' }}>
      <div className="container text-center">
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Start Monitoring Today</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          Join the CardioSentinel platform and bring AI-powered cardiac risk monitoring to your clinical workflow.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/login" className="btn btn-lg" style={{ background: 'white', color: '#0f4c81', fontWeight: 700, borderRadius: '10px', padding: '0.9rem 2.5rem' }}>
            Sign In to Dashboard
          </Link>
          <Link to="/contact" className="btn btn-lg" style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)', fontWeight: 600, borderRadius: '10px', padding: '0.9rem 2.5rem' }}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </>
);

export default Home;
