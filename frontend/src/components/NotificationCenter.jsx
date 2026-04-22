import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) setNotifications(res.data);
    } catch {
      // Silently fail
    }
  };

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeLabel = (type) => {
    if (type === 'leave') return 'Leave';
    if (type === 'transfer') return 'Transfer';
    if (type === 'announcement') return 'Announcement';
    return 'System';
  };

  const typeColor = (type) => {
    if (type === 'leave') return '#0077b6';
    if (type === 'transfer') return '#2f2f8f';
    if (type === 'announcement') return '#6c757d';
    return '#aaa';
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Bell button */}
      <button
        onClick={() => setShow(s => !s)}
        title="Notifications"
        style={{
          background: show ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'white',
          cursor: 'pointer',
          width: '34px', height: '34px',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          fontSize: '1rem',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            backgroundColor: '#ff3d3d', color: 'white',
            fontSize: '0.6rem', fontWeight: '700',
            borderRadius: '10px', padding: '1px 4px',
            minWidth: '14px', textAlign: 'center',
            lineHeight: '1.5', letterSpacing: '-0.5px',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — opens to the RIGHT of the sidebar into main content */}
      {show && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: '260px',      /* just past the sidebar edge */
          width: '340px',
          maxHeight: '460px',
          overflowY: 'auto',
          backgroundColor: 'white',
          color: '#333',
          borderRadius: '10px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          zIndex: 9999,
          border: '1px solid #e5e7eb',
        }}>
          {/* Header */}
          <div style={{
            padding: '13px 16px', borderBottom: '1px solid #f0f0f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-blue)' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: '#ff3d3d', color: 'white', fontSize: '0.65rem', borderRadius: '10px', padding: '1px 6px', fontWeight: '700' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '600', padding: '2px 6px' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#bbb' }}>
              <div style={{ marginBottom: '8px', fontSize: '1.6rem', opacity: 0.4 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div style={{ fontSize: '0.88rem' }}>No notifications yet</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  backgroundColor: n.is_read ? 'white' : 'rgba(47,47,143,0.03)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {/* Type pill */}
                  <span style={{
                    flexShrink: 0, marginTop: '2px',
                    fontSize: '0.65rem', fontWeight: '700',
                    padding: '2px 7px', borderRadius: '10px',
                    backgroundColor: typeColor(n.type) + '18',
                    color: typeColor(n.type),
                    border: `1px solid ${typeColor(n.type)}30`,
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                  }}>
                    {typeLabel(n.type)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                      {!n.is_read && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2f2f8f', flexShrink: 0, marginLeft: '6px' }} />}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '3px', lineHeight: '1.4' }}>{n.message}</div>
                    <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '4px' }}>
                      {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
