import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ChatBot from '../UI/ChatBot';
import apiClient from '../../services/apiClient';
import socketService from '../../services/socketService';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  patients:  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  alerts:    'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  analytics: 'M18 20V10 M12 20V4 M6 20v-6',
  admin:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

const navItems = [
  { to: '/dashboard', icon: ICONS.dashboard, label: 'Dashboard' },
  { to: '/patients',  icon: ICONS.patients,  label: 'Patients' },
  { to: '/alerts',    icon: ICONS.alerts,    label: 'Alerts' },
  { to: '/analytics', icon: ICONS.analytics, label: 'Analytics' },
];

const DashboardLayout = ({ children, title, patientContext }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); };
  const sidebarW = collapsed ? '68px' : '252px';

  // Load initial pending alerts + listen for real-time new-alert events via Socket.io
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await apiClient.get('/api/alerts', { params: { status: 'pending', limit: 5 } });
        setPendingAlerts(data.alerts || []);
      } catch (err) { console.warn('Notification bell fetch failed:', err.message); }
    };
    fetchPending();

    const socket = socketService.connect();
    const handleNewAlert = (alert) => {
      setPendingAlerts(prev => {
        const updated = [alert, ...prev];
        return updated.slice(0, 5);
      });
    };
    socket.on('new-alert', handleNewAlert);

    return () => {
      socket.off('new-alert', handleNewAlert);
    };
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f8fb' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarW, minHeight: '100vh', background: 'linear-gradient(180deg,#0f2840 0%,#0a1f33 100%)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: '68px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#0f4c81,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
          </div>
          {!collapsed && <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-serif)', whiteSpace: 'nowrap' }}>CardioSentinel</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[...navItems, ...(user?.role === 'admin' ? [{ to: '/admin', icon: ICONS.admin, label: 'Admin' }] : [])].map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', transition: 'all 0.2s',
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(15,118,110,0.25)' : 'transparent',
              borderLeft: isActive ? '3px solid #14b8a6' : '3px solid transparent',
            })}>
              <Icon d={item.icon} size={18} />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0f4c81,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{user?.role}</div>
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
            <Icon d={ICONS.logout} size={18} />
            {!collapsed && 'Logout'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'absolute', top: '1.2rem', right: '-14px', width: 28, height: 28, borderRadius: '50%', background: '#0f4c81', border: '2px solid #0a1f33', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', zIndex: 10 }}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ background: 'white', borderBottom: '1px solid #d6e3ee', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 5 }}>
          <h5 style={{ margin: 0, color: '#0f2840', fontWeight: 700, fontSize: '1.1rem' }}>{title}</h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Welcome, <span style={{ color: '#0f4c81', fontWeight: 700 }}>{user?.fullName?.split(' ')[0]}</span>
            </div>

            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setBellOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={bellOpen ? '#0f4c81' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {pendingAlerts.length > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, background: '#dc2626', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pendingAlerts.length}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div style={{ position: 'absolute', top: '2.5rem', right: 0, width: 300, background: 'white', borderRadius: '14px', boxShadow: '0 12px 40px rgba(15,40,64,0.18)', border: '1px solid #d6e3ee', zIndex: 100 }}>
                  <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f2840', fontSize: '0.875rem' }}>Pending Alerts</span>
                    <button onClick={() => { setBellOpen(false); navigate('/alerts'); }} style={{ background: 'none', border: 'none', color: '#0f4c81', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>View all</button>
                  </div>
                  {pendingAlerts.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>No pending alerts</div>
                  ) : (
                    pendingAlerts.map(a => (
                      <div key={a._id} onClick={() => { setBellOpen(false); navigate(a.patientId?._id ? `/patients/${a.patientId._id}` : '/alerts'); }} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f2840', fontSize: '0.82rem' }}>{a.patientId?.name || 'Patient'}</span>
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: a.alertType === 'urgent' ? '#fee2e2' : '#fef3c7', color: a.alertType === 'urgent' ? '#991b1b' : '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>{a.alertType}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{a.riskScore ? (a.riskScore * 100).toFixed(0) + '%' : '—'}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.2rem' }}>{new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} title="System Online" />
          </div>
        </header>

        {/* Content */}
        <motion.main
          key={title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}
        >
          {children}
        </motion.main>
      </div>

      {/* Floating Chatbot */}
      <ChatBot patientContext={patientContext} />
    </div>
  );
};

export default DashboardLayout;
