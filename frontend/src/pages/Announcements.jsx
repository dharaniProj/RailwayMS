import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Announcements() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('24');
  const [posting, setPosting] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { title, message, duration_hours: parseInt(duration) };
      
      if (editId) {
        await axios.put(`http://localhost:5000/api/announcements/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Announcement updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/announcements', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Announcement posted successfully!');
      }
      
      setTitle('');
      setMessage('');
      setDuration('24');
      setEditId(null);
      fetchAnnouncements();
    } catch (err) {
      alert('Error posting/updating announcement');
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = (announcement) => {
    setTitle(announcement.title);
    setMessage(announcement.message);
    setDuration('24'); // Reset or calculate remaining duration if needed
    setEditId(announcement.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (err) {
      alert('Error deleting announcement');
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead || role === 'admin') return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/announcements/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state to remove red dot
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">
        <h2>Announcements</h2>
        
        {role === 'admin' && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editId ? 'Edit Announcement' : 'Post New Announcement'}
              {editId && <button className="btn btn-danger" onClick={() => { setEditId(null); setTitle(''); setMessage(''); }} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Cancel Edit</button>}
            </h3>
            <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="E.g. System Maintenance" />
              </div>
              <div className="input-group">
                <label>Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows="3" placeholder="Write the announcement details here..."></textarea>
              </div>
              <div className="input-group">
                <label>Duration (Hours)</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="1">1 Hour</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">168 Hours (1 Week)</option>
                </select>
              </div>
              <button type="submit" className="btn" disabled={posting} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
                {posting ? 'Saving...' : (editId ? 'Update Announcement' : 'Post Announcement')}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Active Announcements</h3>
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active announcements.</p> : announcements.map(a => (
                <div 
                  key={a.id} 
                  onClick={() => handleMarkAsRead(a.id, a.is_read)}
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    backgroundColor: (!a.is_read && role === 'employee') ? 'rgba(47, 47, 143, 0.05)' : 'transparent',
                    cursor: (!a.is_read && role === 'employee') ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  {(!a.is_read && role === 'employee') && (
                    <div style={{ position: 'absolute', top: '15px', left: '-5px', width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%' }}></div>
                  )}
                  {role === 'admin' && (
                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(a); }} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }}>X</button>
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-blue)', paddingRight: role === 'admin' ? '80px' : '0' }}>{a.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0' }}>{a.message}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posted: {new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
