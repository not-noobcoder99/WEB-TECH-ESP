import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import apiClient from '../services/apiClient';
import ticketService from '../services/ticketService';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const ROLE_COLORS = { admin: '#7c3aed', clinician: '#0f4c81', nurse: '#0f766e' };

const Admin = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('tickets');
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [createForm, setCreateForm] = useState({ fullName: '', username: '', email: '', password: '', role: 'clinician', department: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [t, s, u] = await Promise.all([
          ticketService.getAllTickets({ limit: 50 }),
          apiClient.get('/api/analytics/dashboard'),
          apiClient.get('/api/auth/users'),
        ]);
        setTickets(t.tickets || []);
        setStats(s.data);
        setUsers(u.data.users || []);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUserUpdate = async (id, update) => {
    setUpdatingUser(id);
    try {
      await apiClient.patch(`/api/auth/users/${id}`, update);
      toast.success('User updated');
      const u = await apiClient.get('/api/auth/users');
      setUsers(u.data.users || []);
    } catch { toast.error('Failed to update user'); }
    finally { setUpdatingUser(null); }
  };

  const updateTicket = async (id, update) => {
    try {
      await apiClient.patch(`/api/tickets/${id}`, update);
      toast.success('Ticket updated');
      const t = await ticketService.getAllTickets({ limit: 50 });
      setTickets(t.tickets || []);
    } catch { toast.error('Failed to update ticket'); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await authService.createStaffUser(createForm);
      toast.success(`Staff account created for ${createForm.fullName}`);
      setCreateForm({ fullName: '', username: '', email: '', password: '', role: 'clinician', department: '' });
      const u = await apiClient.get('/api/auth/users');
      setUsers(u.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setCreating(false);
    }
  };

  const setC = (k, v) => setCreateForm(p => ({ ...p, [k]: v }));

  const STATUS_COLOR = { open: '#ef4444', 'in-progress': '#f59e0b', resolved: '#10b981', closed: '#9ca3af' };
  const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <DashboardLayout title="Admin Panel">

      {/* System Overview */}
      {stats && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Patients', value: stats.totalPatients, color: '#0f4c81' },
            { label: 'Active Patients', value: stats.activePatients, color: '#0f766e' },
            { label: 'High Risk', value: stats.highRiskPatients, color: '#dc2626' },
            { label: 'Pending Alerts', value: stats.pendingAlerts, color: '#f59e0b' },
            { label: 'Clinical Users', value: stats.totalUsers, color: '#7c3aed' },
            { label: 'Total Alerts', value: stats.totalAlerts, color: '#06b6d4' },
          ].map(s => (
            <div className="col-6 col-md-4 col-xl-2" key={s.label}>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #d6e3ee', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f3f8fb', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem', width: 'fit-content' }}>
        {[['tickets', 'Support Tickets'], ['users', 'User Management'], ['create', 'Create Staff'], ['system', 'System Info']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? 'white' : 'transparent', color: tab === t ? '#0f4c81' : '#6b7280', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {tab === 'tickets' && (
            <div className="content-card" style={{ overflowX: 'auto' }}>
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                  <div>No support tickets yet</div>
                </div>
              ) : (
                <table className="table data-table mb-0">
                  <thead>
                    <tr><th>Ticket</th><th>Type</th><th>Priority</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f2840' }}>{t.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t.email}</div>
                          {t.subject && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{t.subject}</div>}
                        </td>
                        <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{t.ticketType}</span></td>
                        <td><span style={{ color: PRIORITY_COLOR[t.priority], fontWeight: 700, fontSize: '0.85rem' }}>{t.priority}</span></td>
                        <td><span style={{ background: `${STATUS_COLOR[t.status]}20`, color: STATUS_COLOR[t.status], padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{t.status}</span></td>
                        <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {t.status === 'open' && (
                              <button onClick={() => updateTicket(t._id, { status: 'in-progress' })} style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '5px', border: 'none', background: '#fef3c7', color: '#92400e', fontWeight: 600, cursor: 'pointer' }}>
                                In Progress
                              </button>
                            )}
                            {t.status !== 'resolved' && t.status !== 'closed' && (
                              <button onClick={() => updateTicket(t._id, { status: 'resolved' })} style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '5px', border: 'none', background: '#d1fae5', color: '#065f46', fontWeight: 600, cursor: 'pointer' }}>
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="content-card" style={{ overflowX: 'auto' }}>
              {users.filter(u => u.role !== 'patient').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                  <div>No users found</div>
                </div>
              ) : (
                <table className="table data-table mb-0">
                  <thead>
                    <tr><th>User</th><th>Username</th><th>Role</th><th>Department</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role !== 'patient').map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${ROLE_COLORS[u.role] || '#6b7280'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: ROLE_COLORS[u.role] || '#6b7280', fontSize: '0.9rem' }}>
                              {u.fullName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f2840', fontSize: '0.875rem' }}>{u.fullName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>@{u.username}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={e => handleUserUpdate(u._id, { role: e.target.value })}
                            disabled={updatingUser === u._id}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: `1px solid ${ROLE_COLORS[u.role] || '#d6e3ee'}`, background: `${ROLE_COLORS[u.role] || '#6b7280'}15`, color: ROLE_COLORS[u.role] || '#374151', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <option value="clinician">Clinician</option>
                            <option value="nurse">Nurse</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{u.department || '—'}</td>
                        <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span style={{ background: u.isActive ? '#d1fae5' : '#fee2e2', color: u.isActive ? '#065f46' : '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleUserUpdate(u._id, { isActive: !u.isActive })}
                            disabled={updatingUser === u._id}
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '5px', border: 'none', background: u.isActive ? '#fee2e2' : '#d1fae5', color: u.isActive ? '#991b1b' : '#065f46', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'create' && (
            <div className="content-card" style={{ maxWidth: '540px' }}>
              <h6 style={{ color: '#0f2840', fontWeight: 700, marginBottom: '0.4rem' }}>Create Clinical Staff Account</h6>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Staff accounts (clinicians, nurses, admins) can only be created here. They cannot self-register.
              </p>
              <form onSubmit={handleCreateStaff}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" placeholder="Dr. Jane Smith" value={createForm.fullName} onChange={e => setC('fullName', e.target.value)} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" placeholder="jsmith" value={createForm.username} onChange={e => setC('username', e.target.value)} required minLength={3} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={createForm.role} onChange={e => setC('role', e.target.value)}>
                      <option value="clinician">Clinician</option>
                      <option value="nurse">Nurse</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="doctor@hospital.com" value={createForm.email} onChange={e => setC('email', e.target.value)} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Temporary Password</label>
                    <input type="password" className="form-control" placeholder="Min. 6 characters" value={createForm.password} onChange={e => setC('password', e.target.value)} required minLength={6} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Department (optional)</label>
                    <input type="text" className="form-control" placeholder="Cardiology" value={createForm.department} onChange={e => setC('department', e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary-brand w-100 mt-4" disabled={creating} style={{ borderRadius: '10px', padding: '0.85rem' }}>
                  {creating ? 'Creating account…' : 'Create Staff Account →'}
                </button>
              </form>
            </div>
          )}

          {tab === 'system' && (
            <div className="row g-4">
              {[
                { title: 'Backend API', items: [['Status', '● Running'], ['Port', '5000'], ['Auth', 'JWT (7d expiry)'], ['Routes', '7 groups, 30+ endpoints']] },
                { title: 'AI Service', items: [['Status', '● Running'], ['Port', '8000'], ['Model', 'LogisticRegression_C1'], ['Features', '13 clinical']] },
                { title: 'Database', items: [['Engine', 'MongoDB'], ['Collections', '5'], ['ORM', 'Mongoose'], ['Auth', 'Connection string in .env']] },
              ].map(s => (
                <div className="col-md-4" key={s.title}>
                  <div className="content-card p-4">
                    <h6 style={{ color: '#0f2840', marginBottom: '1.25rem', fontWeight: 700 }}>{s.title}</h6>
                    {s.items.map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
                        <span style={{ color: '#6b7280' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: v.startsWith('●') ? '#10b981' : '#0f4c81' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Admin;
