import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#0f4c81">
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/project', label: 'Project' },
    { to: '/dataset', label: 'Dataset' },
    { to: '/pipeline', label: 'Pipeline' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <HeartIcon />
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#0f4c81', fontSize: '1.2rem' }}>CardioSentinel</span>
        </Link>

        <button className="navbar-toggler border-0" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto gap-1">
            {publicLinks.map(l => (
              <li className="nav-item" key={l.to}>
                <NavLink className="nav-link px-3" to={l.to} style={({ isActive }) => isActive ? { color: '#0f4c81', fontWeight: 700 } : {}}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-sm" style={{ background: 'rgba(15,76,129,0.08)', color: '#0f4c81', fontWeight: 600, borderRadius: '8px', padding: '0.5rem 1rem' }}>
                  Dashboard
                </Link>
                <div className="dropdown">
                  <button className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown"
                    style={{ background: '#0f4c81', color: 'white', fontWeight: 600, borderRadius: '8px', padding: '0.5rem 1rem', border: 'none' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      {user?.fullName?.[0]?.toUpperCase() || 'U'}
                    </span>
                    {user?.fullName?.split(' ')[0]}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ borderRadius: '12px', minWidth: '160px' }}>
                    <li><span className="dropdown-item-text text-muted" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>{user?.role?.toUpperCase()}</span></li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li><button className="dropdown-item text-danger fw-600" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary-brand" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
