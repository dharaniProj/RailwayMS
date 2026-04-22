import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const icons = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  directory: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M17 11a4 4 0 1 1-2.3-3.87',
  announcements: 'M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z M12 17v4 M8 21h8',
  leaves: 'M2 20h.01 M7 20v-4 M12 20v-8 M17 20V8 M22 4v16',
  transfers: 'M5 12h14 M12 5l7 7-7 7',
  railwayPass: 'M2 9h20 M2 15h20 M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  salary: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  documents: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  meetings: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

const NavLink = ({ to, icon, label, badge }) => (
  <li style={{ margin: 0, padding: 0 }}>
    <RouterNavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.6rem 1.2rem',
        textDecoration: 'none',
        color: isActive ? 'white' : '#a5a5d8',
        backgroundColor: isActive ? '#3d3dbd' : 'transparent',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        fontWeight: isActive ? '600' : '500',
        position: 'relative',
        fontSize: '0.92rem'
      })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
        <path d={icons[icon]} />
      </svg>
      <span>{label}</span>
      {badge > 0 && (
        <span style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          backgroundColor: '#ff4d4d', color: 'white', borderRadius: '50%', width: '16px', height: '16px',
          fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
        }}>{badge}</span>
      )}
    </RouterNavLink>
  </li>
);

function Sidebar({ role }) {
  const navigate = useNavigate();
  const [unreadAnn, setUnreadAnn] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_BASE_URL}/api/announcements/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadAnn(res.data.count);
      } catch (err) { console.error(err); }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      backgroundColor: '#2f2f8f',
      color: 'white',
      padding: '1rem 0.8rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
      zIndex: 100
    }}>
      <div style={{ textAlign: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src="/logo.png" alt="Railway Logo" style={{ width: '50px', marginBottom: '0.4rem' }} />
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '1px', color: '#ffffff' }}>RAILWAY MS</h2>
        <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', color: '#a5a5d8', textTransform: 'uppercase', letterSpacing: '2px' }}>{role} Portal</p>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', padding: 0, margin: 0 }}>
          <NavLink to={role === 'admin' ? '/admin' : '/employee'} icon="dashboard" label="Dashboard" />
          <NavLink to={`/${role}/profile`} icon="profile" label="Profile" />
          {role === 'admin' && <NavLink to="/admin/directory" icon="directory" label="Employee Directory" />}
          <NavLink to={`/${role}/salary`} icon="salary" label="Salary" />
          <NavLink to={`/${role}/leaves`} icon="leaves" label="Leaves" />
          <NavLink to={`/${role}/transfers`} icon="transfers" label="Transfers" />
          <NavLink to={`/${role}/railway-pass`} icon="railwayPass" label="Railway Pass" />
          <NavLink to={`/${role}/documents`} icon="documents" label="Documents" />
          <NavLink to={`/${role}/meetings`} icon="meetings" label="Meetings" />
          <NavLink to={`/${role}/announcements`} icon="announcements" label="Announcements" badge={unreadAnn} />
        </ul>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ff8a8a',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            borderRadius: '8px',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,138,138,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <path d={icons.logout} />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
