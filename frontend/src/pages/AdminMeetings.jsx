import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import { Link } from 'react-router-dom';

function AdminMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [type, setType] = useState('online');
    const [link, setLink] = useState('');
    const [location, setLocation] = useState('');
    const [agenda, setAgenda] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [documents, setDocuments] = useState(null);

    // MoM Form state
    const [momMeetingId, setMomMeetingId] = useState(null);
    const [momDocument, setMomDocument] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [meetingsRes, empRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/meetings/admin`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setMeetings(meetingsRes.data);
            setEmployees(empRes.data.filter(e => e.role !== 'admin'));
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('meeting_date', meetingDate);
            formData.append('meeting_time', meetingTime);
            formData.append('type', type);
            if (type === 'online') formData.append('link', link);
            else formData.append('location', location);
            formData.append('agenda', agenda);
            formData.append('participants', JSON.stringify(selectedParticipants));
            
            if (documents) {
                for (let i = 0; i < documents.length; i++) {
                    formData.append('documents', documents[i]);
                }
            }

            await axios.post(`${API_BASE_URL}/api/meetings`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Meeting scheduled and invitations sent!');
            setShowForm(false);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating meeting.');
        }
    };

    const handleUploadMoM = async (e) => {
        e.preventDefault();
        if (!momDocument) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('mom', momDocument);

            await axios.put(`${API_BASE_URL}/api/meetings/${momMeetingId}/mom`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Minutes of Meeting uploaded successfully.');
            setMomMeetingId(null);
            setMomDocument(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading MoM.');
        }
    };

    const resetForm = () => {
        setTitle(''); setMeetingDate(''); setMeetingTime(''); setType('online');
        setLink(''); setLocation(''); setAgenda(''); setSelectedParticipants([]); setDocuments(null);
    };

    const toggleParticipant = (id) => {
        if (selectedParticipants.includes(id)) {
            setSelectedParticipants(selectedParticipants.filter(p => p !== id));
        } else {
            setSelectedParticipants([...selectedParticipants, id]);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <Sidebar role="admin" />
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
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>Meetings & Conferences</h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#ffffff', opacity: 1 }}>Schedule meetings, invite employees, and manage records.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <NotificationCenter />
                        <img src={user.profile_photo_url || `https://ui-avatars.com/api/?name=Admin&background=random`} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
                    </div>
                </div>

                {error && <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? 'Cancel' : '+ Schedule New Meeting'}
                    </button>
                </div>

                {showForm && (
                    <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Schedule Meeting</h3>
                        <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Meeting Title *</label>
                                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly Review" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Date *</label>
                                        <input type="date" required value={meetingDate} onChange={e => setMeetingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Time *</label>
                                        <input type="time" required value={meetingTime} onChange={e => setMeetingTime(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Type *</label>
                                    <select value={type} onChange={e => setType(e.target.value)}>
                                        <option value="online">Online (Video Call)</option>
                                        <option value="offline">Offline (In Person)</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    {type === 'online' ? (
                                        <>
                                            <label>Meeting Link (Zoom, Meet, Webex) *</label>
                                            <input type="url" required value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
                                        </>
                                    ) : (
                                        <>
                                            <label>Location/Room *</label>
                                            <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Conference Room A" />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '0.5rem' }}>
                                <label>Agenda / Description</label>
                                <textarea value={agenda} onChange={e => setAgenda(e.target.value)} rows="3" placeholder="Brief points about the meeting..."></textarea>
                            </div>

                            <div style={{ border: '1px solid var(--border)', padding: '1.2rem', borderRadius: 'var(--radius)', background: '#fafafa' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text)' }}>Invite Participants</label>
                                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
                                    {employees.map(emp => (
                                        <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.6rem 0.8rem', background: selectedParticipants.includes(emp.id) ? '#e0e7ff' : '#ffffff', border: selectedParticipants.includes(emp.id) ? '1px solid #c7d2fe' : '1px solid #e2e8f0', borderRadius: '8px', transition: 'all 0.2s', fontSize: '0.88rem' }}>
                                            <input type="checkbox" checked={selectedParticipants.includes(emp.id)} onChange={() => toggleParticipant(emp.id)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }} />
                                            {emp.name} ({emp.employee_id})
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '0.5rem' }}>
                                <label>Attach Documents (Circulars, Notes - PDF/JPG/PNG only)</label>
                                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocuments(e.target.files)} style={{ padding: '0.5rem' }} />
                            </div>

                            <button type="submit" className="btn" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', fontSize: '0.95rem', borderRadius: '30px', boxShadow: '0 4px 12px rgba(47,47,143,0.2)' }}>
                                ✨ Send Invitations & Schedule
                            </button>
                        </form>
                    </div>
                )}

                {/* Meetings List */}
                <h3 style={{ borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem', display: 'inline-block' }}>All Meetings</h3>
                
                {loading ? <p>Loading...</p> : meetings.length === 0 ? <p>No meetings found.</p> : (
                    <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
                        {meetings.map(m => (
                            <div key={m.id} className="card" style={{ 
                                padding: '2rem', 
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
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--primary-blue)' }}>{m.title}</h4>
                                        <div style={{ display: 'flex', gap: '1.5rem', color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📅 {new Date(m.meeting_date).toLocaleDateString()}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>⏰ {m.meeting_time}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {m.type === 'online' ? `🌐 Online (${m.link})` : `🏢 ${m.location}`}
                                            </span>
                                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', background: m.status === 'Scheduled' ? '#fff3cd' : '#d4edda', color: m.status === 'Scheduled' ? '#856404' : '#155724' }}>
                                                {m.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {m.status !== 'Completed' && (
                                        <button onClick={() => setMomMeetingId(momMeetingId === m.id ? null : m.id)} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                                            Upload MoM
                                        </button>
                                    )}
                                </div>

                                {m.agenda && (
                                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                        <strong>Agenda:</strong><br/>
                                        {m.agenda}
                                    </div>
                                )}

                                {/* Attachments */}
                                {m.documents && m.documents.length > 0 && m.documents[0].id && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong>Attachments: </strong>
                                        {m.documents.map(doc => (
                                            <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: 'var(--primary-blue)', textDecoration: 'none', background: '#eef2ff', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85rem' }}>
                                                📎 {doc.file_name}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* MoM Document */}
                                {m.mom_url && (
                                    <div style={{ marginBottom: '1rem', background: '#e8f5e9', padding: '0.8rem', borderRadius: '6px' }}>
                                        <strong>Minutes of Meeting: </strong>
                                        <a href={m.mom_url} target="_blank" rel="noreferrer" style={{ color: '#2e7d32', fontWeight: 'bold' }}>View Document</a>
                                    </div>
                                )}

                                {/* Upload MoM Form */}
                                {momMeetingId === m.id && (
                                    <form onSubmit={handleUploadMoM} style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input type="file" required accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => setMomDocument(e.target.files[0])} className="form-input" style={{ flex: 1 }} />
                                        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Save MoM & Mark Completed</button>
                                    </form>
                                )}

                                {/* Participant Statuses */}
                                {m.participants && m.participants.length > 0 && m.participants[0].id && (
                                    <div>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Participant Confirmations</h5>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {m.participants.map(p => (
                                                <div key={p.id} style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', background: p.status === 'Confirmed' ? '#d4edda' : '#fff3cd', border: `1px solid ${p.status === 'Confirmed' ? '#c3e6cb' : '#ffeeba'}` }}>
                                                    {p.name}: <strong>{p.status}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminMeetings;
