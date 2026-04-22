import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import NotificationCenter from './NotificationCenter';

// Simple SVG icon component
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const NAV_ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  register: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  announcements: 'M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z M12 17v4 M8 21h8',
  leaves: 'M2 20h.01 M7 20v-4 M12 20v-8 M17 20V8 M22 4v16',
  transfers: 'M5 12h14 M12 5l7 7-7 7',
  salary: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  documents: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadAnn, setUnreadAnn] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/announcements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const count = Array.isArray(res.data) ? res.data.filter(a => !a.is_read).length : 0;
        setUnreadAnn(count);
      } catch { /* ignore */ }
    };
    fetchUnread();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon, label, badge }) => {
    const active = isActive(to);
    return (
      <li style={{ listStyle: 'none' }}>
        <Link
          to={to}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '0.68rem 1.4rem',
            color: active ? 'white' : 'rgba(255,255,255,0.68)',
            textDecoration: 'none',
            backgroundColor: active ? 'rgba(255,255,255,0.14)' : 'transparent',
            borderRight: active ? '3px solid white' : '3px solid transparent',
            fontWeight: active ? '600' : '400',
            fontSize: '0.88rem',
            transition: 'all 0.18s',
            position: 'relative',
          }}
        >
          {icon && <Icon d={NAV_ICONS[icon]} size={15} />}
          <span style={{ flex: 1 }}>{label}</span>
          {badge > 0 && (
            <span style={{ background: '#ff3d3d', color: 'white', fontSize: '0.62rem', borderRadius: '10px', padding: '1px 5px', fontWeight: '700', minWidth: '14px', textAlign: 'center' }}>
              {badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div
      className="sidebar"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', width: '250px', top: 0, left: 0 }}
    >
      {/* Brand / Header */}
      <div style={{ padding: '0 1.2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="Railway Logo"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              onError={e => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Railway MS</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Management System</div>
          </div>
        </div>
        <NotificationCenter />
      </div>

      {/* Role badge */}
      <div style={{ padding: '0.6rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '20px' }}>
          {role === 'admin' ? 'Administrator' : 'Employee'}
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0' }}>
        <ul style={{ margin: 0, padding: 0 }}>
          <NavLink to={`/${role}`} icon="dashboard" label="Dashboard" />

          {role === 'admin' && (
            <>
              <NavLink to="/admin/register-employee" icon="register" label="Register Employee" />
              <NavLink to="/admin/profile" icon="profile" label="My Profile" />
            </>
          )}
          {role === 'employee' && (
            <NavLink to="/employee/profile" icon="profile" label="My Profile" />
          )}

          <NavLink to={`/${role}/announcements`} icon="announcements" label="Announcements" badge={unreadAnn} />
          <NavLink to={`/${role}/leaves`} icon="leaves" label="Leaves" />
          <NavLink to={`/${role}/transfers`} icon="transfers" label="Transfers" />
          <NavLink to={`/${role}/salary`} icon="salary" label="Salary" />
          <NavLink to={`/${role}/documents`} icon="documents" label="Documents" />
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
            padding: '0.6rem 0.9rem', borderRadius: '7px',
            fontSize: '0.88rem', fontWeight: '500', transition: 'all 0.18s',
          }}
        >
          <Icon d={NAV_ICONS.logout} size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
