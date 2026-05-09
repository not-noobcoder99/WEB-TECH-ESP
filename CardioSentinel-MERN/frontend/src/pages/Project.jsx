import React from 'react';
import Navbar from '../components/Layout/Navbar';
import { Link } from 'react-router-dom';

const STACK = [
  { layer: 'Frontend', tech: 'React 18, React Router v6, Bootstrap 5, Recharts', color: '#0f4c81' },
  { layer: 'Backend', tech: 'Node.js, Express.js, Mongoose, JWT Auth, RBAC', color: '#0f766e' },
  { layer: 'Database', tech: 'MongoDB Atlas — 5 collections (Users, Patients, Telemetry, Alerts, Tickets)', color: '#7c3aed' },
  { layer: 'AI Service', tech: 'Python Flask, scikit-learn, pandas, joblib', color: '#dc2626' },
  { layer: 'ML Model', tech: 'LogisticRegression on UCI Heart Disease Dataset (303 samples, 13 features)', color: '#f59e0b' },
];

const COLLECTIONS = [
  { name: 'Users', desc: 'Clinical staff accounts (clinician, nurse, admin) with bcrypt password hashing and JWT authentication' },
  { name: 'Patients', desc: 'Patient demographics + 13-feature clinical baseline used as AI model input (age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal)' },
  { name: 'Telemetry', desc: 'Real-time vital sign readings with embedded AI prediction result (riskScore, riskLevel, confidence, triggeredAlert)' },
  { name: 'Alerts', desc: 'Auto-generated urgent alerts when AI risk score ≥ 0.7. Managed through pending → reviewed → resolved workflow' },
  { name: 'Tickets', desc: 'Support ticket system for clinical questions, telemetry issues, and model queries' },
];

const Project = () => (
  <>
    <Navbar />

    {/* Hero */}
    <section style={{ background: 'linear-gradient(135deg,#0f2840,#0f4c81)', padding: '5rem 0 4rem', color: 'white' }}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '1.25rem' }}>About the Project</span>
            <h1 style={{ color: 'white', marginBottom: '1.25rem' }}>CardioSentinel Remote</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              A full-stack MERN application that integrates a PFA (Programming for AI) machine learning project with a professional web technology platform — enabling real-time cardiac risk prediction and monitoring for clinical teams.
            </p>
            <div className="d-flex gap-3">
              <Link to="/dataset" className="btn" style={{ background: '#14b8a6', color: 'white', fontWeight: 600, borderRadius: '8px', padding: '0.75rem 1.5rem' }}>View Dataset</Link>
              <Link to="/pipeline" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, borderRadius: '8px', padding: '0.75rem 1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>ML Pipeline</Link>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
              alt="Data analytics dashboard"
              style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '16px', opacity: 0.9 }}
            />
          </div>
        </div>
      </div>
    </section>

    {/* Tech Stack */}
    <section style={{ padding: '5rem 0', background: 'white' }}>
      <div className="container">
        <h2 className="text-center mb-2">Technology Stack</h2>
        <p className="text-center mb-5" style={{ color: '#6b7280' }}>Built with modern, production-ready technologies across all layers.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {STACK.map(s => (
            <div key={s.layer} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.25rem 1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #d6e3ee' }}>
              <span style={{ background: s.color, color: 'white', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px' }}>{s.layer}</span>
              <span style={{ color: '#374151', lineHeight: 1.6 }}>{s.tech}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Architecture */}
    <section style={{ padding: '5rem 0', background: '#f3f8fb' }}>
      <div className="container">
        <h2 className="text-center mb-2">System Architecture</h2>
        <p className="text-center mb-5" style={{ color: '#6b7280' }}>Three services working together for seamless monitoring.</p>
        <div className="row g-4">
          {[
            { icon: '⚛️', title: 'React Frontend', desc: '12+ pages including Dashboard, Patient Management, Analytics, Alerts. Communicates with backend via JWT-authenticated Axios calls.', port: ':3000' },
            { icon: '🟢', title: 'Node.js Backend', desc: '7 route groups, 7 controllers, Mongoose models with validation. Role-based access control (clinician, nurse, admin).', port: ':5000' },
            { icon: '🐍', title: 'Flask AI Service', desc: 'Serves LogisticRegression predictions via /predict endpoint. Called automatically on every telemetry record.', port: ':8000' },
          ].map(s => (
            <div className="col-md-4" key={s.title}>
              <div className="content-card p-4 h-100 text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
                <h4 style={{ color: '#0f2840' }}>{s.title}</h4>
                <code style={{ fontSize: '0.75rem', background: '#f3f8fb', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#0f766e' }}>{s.port}</code>
                <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          React → API calls → Node.js → MongoDB &nbsp;|&nbsp; Node.js → /predict → Flask → scikit-learn pipeline
        </div>
      </div>
    </section>

    {/* Database */}
    <section style={{ padding: '5rem 0', background: 'white' }}>
      <div className="container">
        <h2 className="text-center mb-2">Database Collections</h2>
        <p className="text-center mb-5" style={{ color: '#6b7280' }}>MongoDB Atlas with 5 collections designed for clinical workflows.</p>
        <div className="row g-3">
          {COLLECTIONS.map((c, i) => (
            <div className="col-md-6" key={c.name}>
              <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #d6e3ee', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg,#0f4c81,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.75rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h5 style={{ margin: 0, color: '#0f2840' }}>{c.name}</h5>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 0 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: '4rem 0', background: '#0f2840', textAlign: 'center' }}>
      <div className="container">
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Ready to explore?</h3>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>See the ML pipeline in detail or sign in to the dashboard.</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/pipeline" className="btn" style={{ background: '#14b8a6', color: 'white', fontWeight: 700, borderRadius: '8px', padding: '0.85rem 2rem' }}>View ML Pipeline</Link>
          <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, borderRadius: '8px', padding: '0.85rem 2rem' }}>Sign In</Link>
        </div>
      </div>
    </section>
  </>
);

export default Project;
