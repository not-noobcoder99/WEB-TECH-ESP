import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import RiskBadge from '../components/UI/RiskBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import patientService from '../services/patientService';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const INITIAL_FORM = { name: '', age: '', sex: '1', email: '', phone: '', cp: '', trestbps: '', chol: '', fbs: '0', restecg: '0', thalach: '', exang: '0', oldpeak: '', slope: '1', ca: '0', thal: '2' };

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (filterRisk) filters.riskLevel = filterRisk;
      if (filterStatus) filters.status = filterStatus;
      const data = await patientService.getAllPatients(page, 15, filters);
      setPatients(data.patients || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [page, search, filterRisk, filterStatus]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const toggleStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    const next = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await apiClient.patch(`/api/patients/${id}`, { status: next });
      toast.success(`Patient ${next === 'active' ? 'activated' : 'paused'}`);
      fetchPatients();
    } catch { toast.error('Failed to update status'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : isNaN(v) ? v : Number(v)]));
      await patientService.createPatient(payload);
      toast.success('Patient enrolled successfully!');
      setShowModal(false);
      setForm(INITIAL_FORM);
      fetchPatients();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create patient'); }
    finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout title="Patient Management">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{total} patients enrolled</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary-brand" style={{ borderRadius: '8px', padding: '0.65rem 1.5rem' }}>
          + Enroll Patient
        </button>
      </div>

      {/* Filters */}
      <div className="content-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-5">
            <input type="text" className="form-control" placeholder="🔍  Search by name…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setPage(1); }}>
              <option value="">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>
          <div className="col-md-1">
            <button className="btn w-100" style={{ border: '1px solid #d6e3ee', borderRadius: '8px', color: '#6b7280' }} onClick={() => { setSearch(''); setFilterRisk(''); setFilterStatus(''); setPage(1); }}>✕</button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="content-card" style={{ overflowX: 'auto' }}>
          {patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No patients found</div>
              <div style={{ fontSize: '0.875rem' }}>Enroll your first patient to get started.</div>
            </div>
          ) : (
            <>
              <table className="table data-table mb-0">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age / Sex</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                    <th>Last Risk Score</th>
                    <th>Enrolled</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id} onClick={() => navigate(`/patients/${p._id}`)} style={{ cursor: 'pointer' }}>
                      <td><code style={{ background: '#f3f8fb', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#0f4c81', fontWeight: 700, fontSize: '0.8rem' }}>{p.patientId}</code></td>
                      <td style={{ fontWeight: 600, color: '#0f2840' }}>{p.name}</td>
                      <td style={{ color: '#6b7280' }}>{p.age}y / {p.sex === 1 ? 'Male' : 'Female'}</td>
                      <td><RiskBadge level={p.riskLevel} size="sm" /></td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '6px', background: p.status === 'active' ? '#d1fae5' : '#f3f4f6', color: p.status === 'active' ? '#065f46' : '#6b7280' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: p.lastRiskScore >= 0.7 ? '#dc2626' : p.lastRiskScore >= 0.4 ? '#f59e0b' : '#10b981' }}>
                        {p.lastRiskScore != null ? (p.lastRiskScore * 100).toFixed(1) + '%' : '—'}
                      </td>
                      <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={e => toggleStatus(e, p._id, p.status)}
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '5px', border: 'none', background: p.status === 'active' ? '#fef3c7' : '#d1fae5', color: p.status === 'active' ? '#92400e' : '#065f46', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {p.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                        <Link to={`/patients/${p._id}`} style={{ color: '#0f4c81', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem' }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} style={{ width: 36, height: 36, borderRadius: '8px', border: '1px solid', borderColor: n === page ? '#0f4c81' : '#d6e3ee', background: n === page ? '#0f4c81' : 'white', color: n === page ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>{n}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,40,64,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, color: '#0f2840' }}>Enroll New Patient</h4>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <h6 style={{ color: '#0f766e', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Demographics</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="col-md-3"><label className="form-label">Age *</label><input type="number" className="form-control" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required min={1} max={120} /></div>
                <div className="col-md-3"><label className="form-label">Sex *</label><select className="form-select" value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}><option value="1">Male</option><option value="0">Female</option></select></div>
                <div className="col-md-6"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <h6 style={{ color: '#0f766e', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Clinical Baseline (AI Features)</h6>
              <div className="row g-3">
                {[
                  { key: 'cp', label: 'Chest Pain Type (0–3)', type: 'number' },
                  { key: 'trestbps', label: 'Resting BP (mmHg)', type: 'number' },
                  { key: 'chol', label: 'Cholesterol (mg/dl)', type: 'number' },
                  { key: 'thalach', label: 'Max Heart Rate', type: 'number' },
                  { key: 'oldpeak', label: 'ST Depression', type: 'number', step: '0.1' },
                ].map(f => (
                  <div className="col-md-4" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input type={f.type} step={f.step} className="form-control" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                {[
                  { key: 'fbs', label: 'Fasting Blood Sugar', opts: [['0','No'],['1','Yes']] },
                  { key: 'restecg', label: 'Resting ECG', opts: [['0','Normal'],['1','ST-T'],['2','LV Hypertrophy']] },
                  { key: 'exang', label: 'Exercise Angina', opts: [['0','No'],['1','Yes']] },
                  { key: 'slope', label: 'ST Slope', opts: [['0','Up'],['1','Flat'],['2','Down']] },
                  { key: 'ca', label: 'Major Vessels (0–3)', opts: [['0','0'],['1','1'],['2','2'],['3','3']] },
                  { key: 'thal', label: 'Thalassemia', opts: [['1','Normal'],['2','Fixed'],['3','Reversible']] },
                ].map(f => (
                  <div className="col-md-4" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <select className="form-select" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-3 mt-4">
                <button type="submit" className="btn btn-primary-brand" disabled={submitting} style={{ borderRadius: '8px', padding: '0.75rem 2rem' }}>
                  {submitting ? 'Enrolling…' : 'Enroll Patient'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ border: '1px solid #d6e3ee', borderRadius: '8px', padding: '0.75rem 1.5rem', color: '#6b7280' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Patients;
