import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, Cell, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import DashboardLayout from '../components/Layout/DashboardLayout';
import RiskBadge from '../components/UI/RiskBadge';
import RiskTrendBadge from '../components/UI/RiskTrendBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import patientService from '../services/patientService';
import telemetryService from '../services/telemetryService';
import apiClient from '../services/apiClient';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TABS = ['Overview', 'Telemetry', 'Predictions', 'Alerts'];

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ heartRate: '', systolicBP: '', diastolicBP: '', oxygenSaturation: '', temperature: '', notes: '' });
  const [submittingVitals, setSubmittingVitals] = useState(false);
  const [lastPrediction, setLastPrediction] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, t, a, pr] = await Promise.all([
          patientService.getPatient(id),
          patientService.getPatientTelemetry(id),
          patientService.getPatientAlerts(id),
          apiClient.get(`/api/predictions/history/${id}`),
        ]);
        setPatient(p);
        setTelemetry((t.records || []).slice(0, 30).reverse());
        setAlerts(a || []);
        setPredictions(pr.data.history || []);
      } catch { toast.error('Failed to load patient data'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fetchNotes = async () => {
    try {
      const res = await apiClient.get(`/api/patients/${id}/notes`);
      setNotes(res.data || []);
    } catch {}
  };

  useEffect(() => { if (id) fetchNotes(); }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await apiClient.post(`/api/patients/${id}/notes`, { content: newNote.trim() });
      setNewNote('');
      fetchNotes();
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await apiClient.delete(`/api/patients/${id}/notes/${noteId}`);
      fetchNotes();
    } catch { toast.error('Failed to delete note'); }
  };

  const refreshData = async () => {
    try {
      const [p, t, a, pr] = await Promise.all([
        patientService.getPatient(id),
        patientService.getPatientTelemetry(id),
        patientService.getPatientAlerts(id),
        apiClient.get(`/api/predictions/history/${id}`),
      ]);
      setPatient(p);
      setTelemetry((t.records || []).slice(0, 30).reverse());
      setAlerts(a || []);
      setPredictions(pr.data.history || []);
    } catch {}
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    setSubmittingVitals(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(vitalsForm)
          .filter(([k, v]) => v !== '' && k !== 'notes')
          .map(([k, v]) => [k, Number(v)])
      );
      if (vitalsForm.notes) payload.notes = vitalsForm.notes;
      const result = await telemetryService.recordReading(id, payload);
      setLastPrediction(result.aiPrediction || null);
      toast.success('Vitals recorded — AI prediction complete');
      setVitalsForm({ heartRate: '', systolicBP: '', diastolicBP: '', oxygenSaturation: '', temperature: '', notes: '' });
      await refreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record vitals');
    } finally {
      setSubmittingVitals(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header bar
    doc.setFillColor(15, 76, 129);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CardioSentinel Remote — Patient Report', 14, 14);

    doc.setTextColor(40, 40, 40);
    let y = 32;

    // Patient header info
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(patient.name, 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`ID: ${patient.patientId}   Age: ${patient.age}   Sex: ${patient.sex === 1 ? 'Male' : 'Female'}   Status: ${patient.status}   Risk: ${patient.riskLevel?.toUpperCase()}`, 14, y);
    y += 6;
    doc.text(`Enrolled: ${new Date(patient.createdAt).toLocaleDateString()}   Report Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 10;

    // Clinical baseline
    doc.setTextColor(15, 118, 110);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Clinical Baseline Features', 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [['Feature', 'Value']],
      body: clinicalFeatures.map(f => [f.label, f.value != null ? `${f.value}${f.suffix}` : 'Not set']),
      headStyles: { fillColor: [15, 76, 129], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      margin: { left: 14, right: 14 },
      tableWidth: 90,
    });
    y = doc.lastAutoTable.finalY + 10;

    // Last 10 vitals
    if (telemetry.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setTextColor(15, 118, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Vital Signs — Last 10 Readings', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['Time', 'HR (bpm)', 'Sys BP', 'Dia BP', 'SpO₂', 'Risk Score', 'Risk Level']],
        body: [...telemetry].reverse().slice(0, 10).map(t => [
          new Date(t.readingTimestamp).toLocaleString(),
          t.heartRate ?? '—',
          t.systolicBP ?? '—',
          t.diastolicBP ?? '—',
          t.oxygenSaturation ?? '—',
          t.aiPrediction?.riskScore != null ? `${(t.aiPrediction.riskScore * 100).toFixed(1)}%` : '—',
          t.aiPrediction?.riskLevel ?? '—',
        ]),
        headStyles: { fillColor: [15, 76, 129], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 248, 252] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Prediction history
    if (predictions.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setTextColor(15, 118, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AI Prediction History', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['Timestamp', 'Risk Score', 'Risk Level', 'Prediction', 'Confidence', 'Alert']],
        body: predictions.slice(0, 15).map(p => [
          new Date(p.timestamp).toLocaleString(),
          `${(p.riskScore * 100).toFixed(1)}%`,
          p.riskLevel,
          p.prediction === 1 ? 'Disease' : 'No Disease',
          `${(p.confidence * 100).toFixed(1)}%`,
          p.triggeredAlert ? 'Yes' : 'No',
        ]),
        headStyles: { fillColor: [15, 76, 129], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 248, 252] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Active alerts
    const activeAlerts = alerts.filter(a => a.status !== 'resolved');
    if (activeAlerts.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setTextColor(15, 118, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Active Alerts', 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [['Type', 'Status', 'Date', 'Recommendation']],
        body: activeAlerts.map(a => [
          a.alertType,
          a.status,
          new Date(a.createdAt).toLocaleString(),
          a.recommendation || '—',
        ]),
        headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160);
      doc.text(`CardioSentinel Remote — Confidential Patient Record — Page ${i} of ${pageCount}`, 14, 290);
    }

    doc.save(`${patient.patientId}_${patient.name.replace(/\s+/g, '_')}_report.pdf`);
    toast.success('PDF report exported');
  };

  if (loading) return <DashboardLayout title="Patient Detail"><LoadingSpinner /></DashboardLayout>;
  if (!patient) return <DashboardLayout title="Patient Detail"><div style={{ padding: '2rem', color: '#9ca3af' }}>Patient not found.</div></DashboardLayout>;

  const clinicalFeatures = [
    { label: 'Chest Pain Type', value: patient.cp, suffix: '' },
    { label: 'Resting BP', value: patient.trestbps, suffix: ' mmHg' },
    { label: 'Cholesterol', value: patient.chol, suffix: ' mg/dl' },
    { label: 'Fasting Blood Sugar', value: patient.fbs === 1 ? 'Yes' : 'No', suffix: '' },
    { label: 'Resting ECG', value: patient.restecg, suffix: '' },
    { label: 'Max Heart Rate', value: patient.thalach, suffix: ' bpm' },
    { label: 'Exercise Angina', value: patient.exang === 1 ? 'Yes' : 'No', suffix: '' },
    { label: 'ST Depression', value: patient.oldpeak, suffix: '' },
    { label: 'ST Slope', value: patient.slope, suffix: '' },
    { label: 'Major Vessels', value: patient.ca, suffix: '' },
    { label: 'Thalassemia', value: patient.thal, suffix: '' },
  ];

  const patientContext = patient ? { name: patient.name, age: patient.age, sex: patient.sex, riskLevel: patient.riskLevel, riskScore: patient.lastRiskScore } : null;

  return (
    <DashboardLayout title="Patient Detail" patientContext={patientContext}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/patients" style={{ color: '#0f4c81', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          ← Back to Patients
        </Link>
      </div>
      {/* Header card */}
      <div className="content-card p-4 mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'linear-gradient(135deg,#0f4c81,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>
              {patient.name[0].toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#0f2840' }}>{patient.name}</h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <code style={{ background: '#f3f8fb', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#0f4c81', fontWeight: 700, fontSize: '0.8rem' }}>{patient.patientId}</code>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{patient.age}y / {patient.sex === 1 ? 'Male' : 'Female'}</span>
                <RiskBadge level={patient.riskLevel} />
                <RiskTrendBadge predictions={predictions} />
                <span style={{ background: patient.status === 'active' ? '#d1fae5' : '#f3f4f6', color: patient.status === 'active' ? '#065f46' : '#6b7280', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{patient.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            {patient.lastRiskScore != null ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Risk Score</div>
                <div style={{ width: 90, height: 90 }}>
                  <CircularProgressbar
                    value={patient.lastRiskScore * 100}
                    text={`${(patient.lastRiskScore * 100).toFixed(0)}%`}
                    styles={buildStyles({
                      pathColor: patient.lastRiskScore >= 0.7 ? '#dc2626' : patient.lastRiskScore >= 0.4 ? '#f59e0b' : '#10b981',
                      textColor: patient.lastRiskScore >= 0.7 ? '#dc2626' : patient.lastRiskScore >= 0.4 ? '#f59e0b' : '#10b981',
                      trailColor: '#f3f4f6',
                      textSize: '20px',
                    })}
                  />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Last Risk Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d1d5db' }}>—</div>
              </div>
            )}
            <button onClick={handleExportPDF} style={{ background: '#f3f8fb', color: '#0f4c81', border: '1.5px solid #dbeafe', borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ↓ Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f3f8fb', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? 'white' : 'transparent', color: tab === t ? '#0f4c81' : '#6b7280', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="content-card p-4">
              <h5 style={{ color: '#0f2840', marginBottom: '1.25rem' }}>Clinical Baseline Features</h5>
              {clinicalFeatures.map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{f.label}</span>
                  <span style={{ fontWeight: 700, color: '#0f2840', fontSize: '0.875rem' }}>
                    {f.value != null ? f.value + f.suffix : <span style={{ color: '#d1d5db' }}>Not set</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="content-card p-4 mb-4">
              <h5 style={{ color: '#0f2840', marginBottom: '1.25rem' }}>Contact Information</h5>
              {[['Email', patient.email], ['Phone', patient.phone], ['Enrolled', new Date(patient.createdAt).toLocaleDateString()]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6b7280' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="content-card p-4 mb-4">
              <h5 style={{ color: '#0f2840', marginBottom: '1.25rem' }}>Medical History</h5>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 0 }}>{patient.medicalHistory || 'No medical history recorded.'}</p>
            </div>
            <div className="content-card p-4">
              <h5 style={{ color: '#0f2840', marginBottom: '1rem' }}>Clinical Notes</h5>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <textarea
                  className="form-control"
                  rows={2}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a clinical note…"
                  style={{ fontSize: '0.875rem', resize: 'none' }}
                />
                <button onClick={handleAddNote} disabled={addingNote || !newNote.trim()} style={{ background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {addingNote ? '…' : 'Add'}
                </button>
              </div>
              {notes.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0', margin: 0 }}>No clinical notes yet.</p>
              ) : (
                notes.map(n => (
                  <div key={n._id} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '10px', marginBottom: '0.5rem', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>{n.content}</p>
                      <button onClick={() => handleDeleteNote(n._id)} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }} title="Delete note">×</button>
                    </div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#9ca3af' }}>
                      {n.addedBy?.fullName || 'Unknown'} · {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Telemetry */}
      {tab === 'Telemetry' && (
        <div className="content-card p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h5 style={{ color: '#0f2840', margin: 0 }}>Vital Signs History</h5>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Last {telemetry.length} readings</p>
            </div>
            <button
              onClick={() => { setLastPrediction(null); setShowVitalsModal(true); }}
              style={{ background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              + Record Vitals
            </button>
          </div>
          {telemetry.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No telemetry records yet</div>
              <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Record the first vital signs reading to trigger the AI prediction pipeline.</div>
              <button onClick={() => { setLastPrediction(null); setShowVitalsModal(true); }} style={{ background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                Record First Reading
              </button>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={telemetry} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="readingTimestamp" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString()} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={l => new Date(l).toLocaleString()} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="systolicBP" stroke="#0f4c81" name="Systolic BP" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="oxygenSaturation" stroke="#10b981" name="SpO₂" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                <table className="table data-table" style={{ fontSize: '0.8rem' }}>
                  <thead><tr><th>Time</th><th>HR</th><th>Sys BP</th><th>Dia BP</th><th>SpO₂</th><th>Risk Score</th><th>Risk Level</th></tr></thead>
                  <tbody>
                    {[...telemetry].reverse().slice(0, 10).map(t => (
                      <tr key={t._id}>
                        <td style={{ color: '#9ca3af' }}>{new Date(t.readingTimestamp).toLocaleString()}</td>
                        <td>{t.heartRate}</td>
                        <td>{t.systolicBP}</td>
                        <td>{t.diastolicBP}</td>
                        <td>{t.oxygenSaturation ?? '—'}</td>
                        <td style={{ fontWeight: 700, color: t.aiPrediction?.riskScore >= 0.7 ? '#dc2626' : '#374151' }}>{t.aiPrediction?.riskScore != null ? (t.aiPrediction.riskScore * 100).toFixed(1) + '%' : '—'}</td>
                        <td>{t.aiPrediction?.riskLevel ? <RiskBadge level={t.aiPrediction.riskLevel} size="sm" /> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Predictions */}
      {tab === 'Predictions' && (
        <div className="content-card p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h5 style={{ color: '#0f2840', margin: 0 }}>AI Prediction History</h5>
            <button
              onClick={() => { setTab('Telemetry'); setLastPrediction(null); setShowVitalsModal(true); }}
              style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Run New Prediction
            </button>
          </div>
          {predictions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No predictions yet. Predictions run automatically on each telemetry record.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table data-table">
                <thead><tr><th>Timestamp</th><th>Risk Score</th><th>Risk Level</th><th>Prediction</th><th>Confidence</th><th>Alert</th></tr></thead>
                <tbody>
                  {predictions.map(p => (
                    <tr key={p.telemetryId}>
                      <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(p.timestamp).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: p.riskScore >= 0.7 ? '#dc2626' : p.riskScore >= 0.4 ? '#f59e0b' : '#10b981' }}>{(p.riskScore * 100).toFixed(1)}%</td>
                      <td><RiskBadge level={p.riskLevel} size="sm" /></td>
                      <td><span style={{ fontWeight: 600 }}>{p.prediction === 1 ? '🔴 Disease' : '🟢 No Disease'}</span></td>
                      <td>{(p.confidence * 100).toFixed(1)}%</td>
                      <td>{p.triggeredAlert ? '🔔 Yes' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Alerts */}
      {tab === 'Alerts' && (
        <div className="content-card p-4">
          <h5 style={{ color: '#0f2840', marginBottom: '1.5rem' }}>Patient Alerts</h5>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              No alerts for this patient.
            </div>
          ) : (
            alerts.map(a => (
              <div key={a._id} style={{ padding: '1.25rem', background: a.alertType === 'urgent' ? '#fff5f5' : '#fffbeb', borderRadius: '12px', border: `1px solid ${a.alertType === 'urgent' ? '#fecaca' : '#fde68a'}`, marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: a.alertType === 'urgent' ? '#991b1b' : '#92400e', textTransform: 'capitalize' }}>{a.alertType} Alert</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <span style={{ background: a.status === 'resolved' ? '#d1fae5' : '#fef3c7', color: a.status === 'resolved' ? '#065f46' : '#92400e', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{a.status}</span>
                </div>
                {a.recommendation && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>{a.recommendation}</p>}
              </div>
            ))
          )}
        </div>
      )}
      {/* Record Vitals Modal */}
      {showVitalsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,40,64,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowVitalsModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ margin: 0, color: '#0f2840' }}>Record Vital Signs</h4>
                <p style={{ margin: '0.25rem 0 0', color: '#9ca3af', fontSize: '0.8rem' }}>AI prediction runs automatically after recording</p>
              </div>
              <button onClick={() => setShowVitalsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
            </div>

            {/* Prediction Result Banner */}
            {lastPrediction && (
              <div style={{ background: lastPrediction.riskScore >= 0.7 ? '#fef2f2' : lastPrediction.riskScore >= 0.4 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${lastPrediction.riskScore >= 0.7 ? '#fecaca' : lastPrediction.riskScore >= 0.4 ? '#fde68a' : '#bbf7d0'}`, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, color: '#0f2840', marginBottom: '0.75rem' }}>AI Prediction Result</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: lastPrediction.riskScore >= 0.7 ? '#dc2626' : lastPrediction.riskScore >= 0.4 ? '#f59e0b' : '#10b981' }}>
                      {(lastPrediction.riskScore * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Score</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#374151' }}>{(lastPrediction.confidence * 100).toFixed(1)}%</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confidence</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>{lastPrediction.prediction === 1 ? '🔴 Disease' : '🟢 No Disease'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prediction</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <RiskBadge level={lastPrediction.riskLevel} />
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.35rem' }}>Risk Level</div>
                  </div>
                </div>
                {lastPrediction.triggeredAlert && (
                  <div style={{ marginTop: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
                    🔔 High-risk alert triggered and sent to the alerts queue
                  </div>
                )}
                {lastPrediction.featureContributions?.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.9rem' }}>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.8rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Contributing Factors</div>
                    <ResponsiveContainer width="100%" height={lastPrediction.featureContributions.length * 32 + 10}>
                      <BarChart data={lastPrediction.featureContributions} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                        <XAxis type="number" domain={['auto', 'auto']} tick={{ fontSize: 9 }} tickFormatter={v => v.toFixed(2)} />
                        <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v, n, p) => [`${v > 0 ? '+' : ''}${v.toFixed(3)}`, 'Contribution']} labelFormatter={l => l} />
                        <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={1} />
                        <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                          {lastPrediction.featureContributions.map((entry, idx) => (
                            <Cell key={idx} fill={entry.contribution > 0 ? '#ef4444' : '#10b981'} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem', textAlign: 'center' }}>Red = increases risk · Green = reduces risk</div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleRecordVitals}>
              <div className="row g-3 mb-3">
                {[
                  { key: 'heartRate', label: 'Heart Rate (bpm) *', min: 20, max: 300 },
                  { key: 'systolicBP', label: 'Systolic BP (mmHg) *', min: 50, max: 250 },
                  { key: 'diastolicBP', label: 'Diastolic BP (mmHg) *', min: 30, max: 180 },
                  { key: 'oxygenSaturation', label: 'SpO₂ (%)', min: 50, max: 100 },
                  { key: 'temperature', label: 'Temperature (°C)', min: 30, max: 45 },
                ].map(f => (
                  <div className="col-6" key={f.key}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>{f.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      min={f.min}
                      max={f.max}
                      className="form-control"
                      value={vitalsForm[f.key]}
                      onChange={e => setVitalsForm({ ...vitalsForm, [f.key]: e.target.value })}
                      required={f.key === 'heartRate' || f.key === 'systolicBP' || f.key === 'diastolicBP'}
                    />
                  </div>
                ))}
                <div className="col-12">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Clinical Notes</label>
                  <textarea className="form-control" rows={2} value={vitalsForm.notes} onChange={e => setVitalsForm({ ...vitalsForm, notes: e.target.value })} placeholder="Optional observations…" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={submittingVitals} style={{ flex: 1, background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  {submittingVitals ? 'Recording & Predicting…' : 'Record & Run AI Prediction'}
                </button>
                <button type="button" onClick={() => setShowVitalsModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', padding: '0.75rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDetail;
