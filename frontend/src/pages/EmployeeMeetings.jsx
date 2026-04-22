import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';

function EmployeeMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchMeetings();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/meetings/employee`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMeetings(res.data);
        } catch (err) {
            setError('Failed to load meetings.');
        } finally {
            setLoading(false);
        }
    };

    const confirmAttendance = async (meetingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/meetings/${meetingId}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Attendance confirmed. Admin has been notified.');
            fetchMeetings();
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError('Failed to confirm attendance.');
        }
    };

    const getRemainingTime = (dateStr, timeStr) => {
        const meetingDateTime = new Date(`${dateStr.split('T')[0]}T${timeStr}`);
        const diff = meetingDateTime - currentTime;

        if (diff < 0) return 'Meeting has started or passed';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        if (days > 0) return `Starts in: ${days}d ${hours}h ${minutes}m`;
        return `Starts in: ${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <Sidebar role="employee" />
            <div style={{ flex: 1, padding: '2rem', marginLeft: '260px' }}>
                {/* Premium Hero Section */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary-blue) 0%, #4a4ab8 60%, #5c6bc0 100%)',
                    borderRadius: '16px',
                    padding: '2rem 2.5rem',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.5rem',
                    boxShadow: '0 10px 30px rgba(47, 47, 143, 0.15)'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>My Meetings & Conferences</h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#ffffff', opacity: 1 }}>View your schedule, download agendas, and confirm your attendance.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <NotificationCenter />
                        <img src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
                    </div>
                </div>

                {error && <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

                {loading ? <p>Loading your meetings...</p> : meetings.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <h3>No Upcoming Meetings</h3>
                        <p>You have not been invited to any meetings yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {meetings.map(m => {
                            const meetingDateTime = new Date(`${m.meeting_date.split('T')[0]}T${m.meeting_time}`);
                            const isUpcoming = meetingDateTime > currentTime && m.status !== 'Completed';

                            return (
                                <div key={m.id} className="card" style={{ 
                                    padding: '2rem', 
                                    borderLeft: isUpcoming ? '6px solid var(--primary-blue)' : '6px solid #ccc',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-blue)' }}>{m.title}</h3>
                                            <div style={{ display: 'flex', gap: '1.5rem', color: '#555', fontSize: '0.95rem', marginBottom: '1rem' }}>
                                                <span>📅 {new Date(m.meeting_date).toLocaleDateString()}</span>
                                                <span>⏰ {m.meeting_time}</span>
                                                <span>
                                                    {m.type === 'online' ? `🌐 Online (${m.link})` : `🏢 ${m.location}`}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {isUpcoming && (
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d32f2f', background: '#ffebee', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                    ⏳ {getRemainingTime(m.meeting_date, m.meeting_time)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {m.agenda && (
                                        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <strong>Agenda:</strong><br/>
                                            {m.agenda}
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {m.documents && m.documents.length > 0 && m.documents[0].id && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <strong>Attached Documents: </strong>
                                            {m.documents.map(doc => (
                                                <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: 'var(--primary-blue)', textDecoration: 'none', background: '#eef2ff', padding: '6px 12px', borderRadius: '15px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    📎 Download {doc.file_name}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* MoM Document */}
                                    {m.mom_url && (
                                        <div style={{ marginBottom: '1.5rem', background: '#e8f5e9', padding: '1rem', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                                            <strong>Minutes of Meeting Published: </strong>
                                            <a href={m.mom_url} target="_blank" rel="noreferrer" style={{ color: '#2e7d32', fontWeight: 'bold', marginLeft: '10px' }}>
                                                📄 View Final MoM
                                            </a>
                                        </div>
                                    )}

                                    {/* Action Bar */}
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ color: '#666' }}>Your Status: </span>
                                            <strong style={{ color: m.my_status === 'Confirmed' ? '#2e7d32' : '#f57c00' }}>{m.my_status}</strong>
                                        </div>
                                        
                                        {isUpcoming && m.my_status === 'Pending' && (
                                            <button onClick={() => confirmAttendance(m.id)} className="btn-primary" style={{ padding: '0.7rem 1.8rem', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(47,47,143,0.2)' }}>
                                                ✓ Confirm Attendance
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeMeetings;
