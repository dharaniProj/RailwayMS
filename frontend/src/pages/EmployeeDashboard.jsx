import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API = 'http://localhost:5000/api';

function EmployeeDashboard() {
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [leaveCount, setLeaveCount] = useState(null);
  const [showMarquee, setShowMarquee] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(false), 60000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

    const load = async () => {
      try {
        const [profileRes, annRes, leavesRes, transfersRes] = await Promise.all([
          axios.get(`${API}/employees/me`, { headers }),
          axios.get(`${API}/announcements`, { headers }),
          axios.get(`${API}/leaves/me`, { headers }),
          axios.get(`${API}/transfers/me`, { headers }),
        ]);
        setProfile(profileRes.data);
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
        setTransfers(Array.isArray(transfersRes.data) ? transfersRes.data : []);

        if (userId) {
          const detailRes = await axios.get(`${API}/leaves/employee/${userId}`, { headers });
          setLeaveCount(detailRes.data?.leave_count ?? null);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    };
    load();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const pendingLeave = leaves.find(l => l.status === 'pending');
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
  const pendingTransfer = transfers.find(t => t.status === 'pending');
  const latestAnn = announcements[0];

  const StatCard = ({ label, value, sub, color = 'var(--primary-blue)' }) => (
    <div className="card" style={{ textAlign: 'center', padding: '1.2rem', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '1.8rem', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: '600', marginTop: '6px', color: '#333' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.73rem', color: '#aaa', marginTop: '3px' }}>{sub}</div>}
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar role="employee" />
      <div className="main-content">

        {/* Scrolling announcement banner */}
        {showMarquee && latestAnn && (
          <div style={{ background: 'var(--primary-blue)', color: 'white', padding: '8px 16px', borderRadius: '6px', marginBottom: '1.5rem', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>
            <marquee behavior="scroll" direction="left" scrollamount="5">
              <strong>Notice:</strong> {latestAnn.title} — {latestAnn.message}
            </marquee>
          </div>
        )}

        {/* Greeting Hero */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, #4a4ab8 60%, #5c6bc0 100%)',
            color: 'white',
            padding: '2rem 2.5rem',
            marginBottom: '1.5rem',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-60px', right: '-40px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '-30px', right: '120px', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem', position: 'relative' }}>
            <img
              src={profile?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=ffffff&color=2f2f8f&size=100&bold=true`}
              alt="Profile"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: '0.88rem', opacity: 0.7, letterSpacing: '0.5px', marginBottom: '4px', textTransform: 'uppercase' }}>
                {getGreeting()}
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '10px' }}>
                {profile?.name || 'Employee'} <span style={{ fontWeight: '400', opacity: 0.75 }}>— Welcome back</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  {profile?.employee_id || '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {profile?.designation || 'N/A'}
                </span>
                {profile?.work_location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {profile.work_location}
                  </span>
                )}
                {profile?.department && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    {profile.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Leave Balance" value={leaveCount !== null ? leaveCount : '—'} sub="Days remaining" color="var(--primary-blue)" />
          <StatCard label="Leaves Taken" value={approvedLeaves} sub="This year" color="#0077b6" />
          <StatCard label="Leave Status" value={pendingLeave ? 'Pending' : 'Clear'} sub={pendingLeave?.subject || 'No pending request'} color={pendingLeave ? '#fd7e14' : '#28a745'} />
          <StatCard label="Transfer" value={pendingTransfer ? 'Pending' : 'None'} sub={pendingTransfer ? `To: ${pendingTransfer.to_location}` : 'No active request'} color={pendingTransfer ? '#fd7e14' : '#6c757d'} />
        </div>

        {/* Announcements & quick info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Announcements</h4>
            {announcements.length === 0
              ? <p style={{ color: '#aaa', fontSize: '0.88rem' }}>No active announcements.</p>
              : announcements.slice(0, 3).map(a => (
                <div key={a.id} style={{ marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--primary-blue)', marginBottom: '2px' }}>{a.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#666' }}>{a.message}</div>
                  <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '3px' }}>{new Date(a.created_at).toLocaleDateString('en-IN')}</div>
                </div>
              ))
            }
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>My Details</h4>
            {[
              { label: 'Full Name', value: profile?.name },
              { label: 'Department', value: profile?.department },
              { label: 'Designation', value: profile?.designation },
              { label: 'Work Location', value: profile?.work_location },
              { label: 'Email', value: profile?.email },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#888', fontWeight: '500' }}>{item.label}</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{item.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmployeeDashboard;
