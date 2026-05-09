import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import ticketService from '../services/ticketService';
import { toast } from 'react-toastify';

const TYPES = [
  { value: 'clinical-followup', label: 'Clinical Follow-up' },
  { value: 'telemetry-issue', label: 'Telemetry Issue' },
  { value: 'model-question', label: 'AI Model Question' },
  { value: 'research', label: 'Research Inquiry' },
  { value: 'general', label: 'General' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', ticketType: 'general', subject: '', message: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ticketService.submitTicket(form);
      setSubmitted(true);
      toast.success('Ticket submitted successfully! We will respond soon.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section style={{ background: 'linear-gradient(135deg,#edf7ff,#e7fbf8)', padding: '4rem 0 3rem' }}>
        <div className="container text-center">
          <h1>Get in Touch</h1>
          <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
            Have a clinical question, telemetry issue, or research inquiry? Submit a support ticket and our team will respond promptly.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container">
          <div className="row g-5 align-items-start">
            {/* Info column */}
            <div className="col-lg-4">
              <h4 style={{ color: '#0f2840', marginBottom: '1.5rem' }}>Support Channels</h4>
              {[
                { emoji: '🏥', title: 'Clinical Support', desc: 'Patient monitoring, alerts, and clinical workflow queries' },
                { emoji: '📡', title: 'Telemetry Issues', desc: 'Device connectivity, data sync, and reading accuracy' },
                { emoji: '🤖', title: 'AI Model Questions', desc: 'Prediction accuracy, risk scores, and feature interpretation' },
                { emoji: '🔬', title: 'Research', desc: 'Dataset access, model details, and academic collaboration' },
              ].map(s => (
                <div key={s.title} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>{s.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f2840', marginBottom: '0.25rem' }}>{s.title}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <img
                src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80"
                alt="Medical team"
                style={{ width: '100%', borderRadius: '14px', height: '200px', objectFit: 'cover', marginTop: '1rem' }}
              />
            </div>

            {/* Form column */}
            <div className="col-lg-8">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #d1fae5' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ color: '#065f46' }}>Ticket Submitted!</h3>
                  <p style={{ color: '#059669', marginBottom: '1.5rem' }}>Your support ticket has been received. Our clinical team will respond within 24 hours.</p>
                  <button className="btn btn-primary-brand" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', ticketType: 'general', subject: '', message: '', priority: 'medium' }); }}>
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ background: '#f9fafb', padding: '2.5rem', borderRadius: '16px', border: '1px solid #d6e3ee' }}>
                  <h4 style={{ color: '#0f2840', marginBottom: '1.75rem' }}>Submit a Support Ticket</h4>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Dr. John Doe" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="doctor@hospital.com" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Ticket Type *</label>
                      <select className="form-select" value={form.ticketType} onChange={e => setForm({ ...form, ticketType: e.target.value })} required>
                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input type="text" className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your inquiry" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message *</label>
                      <textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required minLength={10} placeholder="Describe your question or issue in detail…" style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                  <div className="mt-4 d-flex gap-3 align-items-center">
                    <button type="submit" className="btn btn-primary-brand" disabled={loading} style={{ borderRadius: '8px', padding: '0.85rem 2rem', fontSize: '1rem' }}>
                      {loading ? 'Submitting…' : 'Submit Ticket →'}
                    </button>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>* Required fields</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
