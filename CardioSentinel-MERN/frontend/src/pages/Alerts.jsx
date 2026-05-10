import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import RiskBadge from '../components/UI/RiskBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import alertService from '../services/alertService';
import apiClient from '../services/apiClient';
import { toast } from 'sonner';

const TYPE_STYLE = { urgent: 'status-urgent', watchlist: 'status-watchlist', stable: 'status-stable' };
const STATUS_STYLE = { pending: 'status-watchlist', reviewed: 'status-stable', resolved: 'status-stable' };

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ pending: 0, urgent: 0, resolvedToday: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selected, setSelected] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { page, limit: 15 };
      if (filterStatus) filters.status = filterStatus;
      if (filterType) filters.alertType = filterType;
      const [data, s] = await Promise.all([
        alertService.getAllAlerts(filters),
        apiClient.get('/api/alerts/stats'),
      ]);
      setAlerts(data.alerts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setStats(s.data);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  }, [page, filterStatus, filterType]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true);
    try {
      await apiClient.patch(`/api/alerts/${id}`, { status, reviewNotes });
      toast.success(`Alert marked as ${status}`);
      setSelected(null);
      setReviewNotes('');
      fetchAlerts();
    } catch { toast.error('Failed to update alert'); }
    finally { setUpdating(false); }
  };

  return (
    <DashboardLayout title="Alerts">
      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Alerts', value: total, color: '#0f4c81' },
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
          { label: 'Urgent', value: stats.urgent, color: '#dc2626' },
          { label: 'Resolved Today', value: stats.resolvedToday, color: '#10b981' },
        ].map(s => (
          <div className="col-6 col-md-3" key={s.label}>
            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #d6e3ee', textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="content-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <select className="form-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="urgent">Urgent</option>
              <option value="watchlist">Watchlist</option>
              <option value="stable">Stable</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn w-100" style={{ border: '1px solid #d6e3ee', borderRadius: '8px', color: '#6b7280' }} onClick={() => { setFilterStatus(''); setFilterType(''); setPage(1); }}>Clear</button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="content-card" style={{ overflowX: 'auto' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontWeight: 600 }}>No alerts match your filters</div>
            </div>
          ) : (
            <>
              <table className="table data-table mb-0">
                <thead>
                  <tr><th>Patient</th><th>Alert Type</th><th>Risk Level</th><th>Risk Score</th><th>Confidence</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {alerts.map(a => (
                    <tr key={a._id}>
                      <td>
                        <Link to={`/patients/${a.patientId?._id}`} style={{ textDecoration: 'none', color: '#0f2840', fontWeight: 600 }}>{a.patientId?.name || '—'}</Link>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{a.patientId?.patientId}</div>
                      </td>
                      <td><span className={TYPE_STYLE[a.alertType] || 'status-watchlist'}>{a.alertType}</span></td>
                      <td><RiskBadge level={a.riskScore >= 0.7 ? 'high' : a.riskScore >= 0.4 ? 'moderate' : 'low'} size="sm" /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', maxWidth: '60px' }}>
                            <div style={{ height: '100%', width: `${(a.riskScore || 0) * 100}%`, background: a.riskScore >= 0.7 ? '#ef4444' : a.riskScore >= 0.4 ? '#f59e0b' : '#10b981', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: a.riskScore >= 0.7 ? '#dc2626' : '#374151', fontSize: '0.85rem' }}>
                            {a.riskScore ? (a.riskScore * 100).toFixed(1) + '%' : '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{a.confidence ? (a.confidence * 100).toFixed(1) + '%' : '—'}</td>
                      <td><span className={STATUS_STYLE[a.status] || 'status-watchlist'}>{a.status}</span></td>
                      <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(a.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setSelected(a); setReviewNotes(''); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #d6e3ee', background: 'white', color: '#0f4c81', fontWeight: 600, cursor: 'pointer' }}>
                            Details
                          </button>
                          {a.status === 'pending' && (
                            <button onClick={() => handleStatusUpdate(a._id, 'reviewed')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '6px', border: 'none', background: '#0f4c81', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem' }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} style={{ width: 36, height: 36, borderRadius: '8px', border: '1px solid', borderColor: n === page ? '#0f4c81' : '#d6e3ee', background: n === page ? '#0f4c81' : 'white', color: n === page ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer' }}>{n}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,40,64,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, color: '#0f2840' }}>Alert Details</h4>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <div style={{ background: '#fee2e2', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>Patient: {selected.patientId?.name}</div>
                  <div style={{ color: '#b91c1c', fontSize: '0.8rem' }}>ID: {selected.patientId?.patientId}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <RiskBadge level={selected.riskScore >= 0.7 ? 'high' : selected.riskScore >= 0.4 ? 'moderate' : 'low'} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{selected.riskScore ? (selected.riskScore * 100).toFixed(1) + '%' : '—'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Risk Score</div>
                </div>
              </div>
            </div>
            {[
              ['Alert Type', selected.alertType],
              ['Confidence', selected.confidence ? (selected.confidence * 100).toFixed(1) + '%' : '—'],
              ['Status', selected.status],
              ['Recommendation', selected.recommendation || '—'],
              ['Created', new Date(selected.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#374151', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
            {selected.status !== 'resolved' && (
              <div style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Review Notes</label>
                <textarea className="form-control" rows={3} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add clinical notes…" style={{ marginBottom: '1rem' }} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selected.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate(selected._id, 'reviewed')} disabled={updating} className="btn btn-primary-brand" style={{ flex: 1, borderRadius: '8px' }}>
                      Mark Reviewed
                    </button>
                  )}
                  <button onClick={() => handleStatusUpdate(selected._id, 'resolved')} disabled={updating} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, padding: '0.6rem', cursor: 'pointer' }}>
                    Resolve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Alerts;
