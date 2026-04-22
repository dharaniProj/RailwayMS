import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API = 'http://localhost:5000/api';

function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState({ type: '', text: '' });

  const [name, setName]         = useState('');
  const [username, setUsername] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/employees/me`, { headers })
      .then(res => {
        setProfile(res.data);
        setName(res.data.name || '');
        setUsername(res.data.employee_id || '');
      })
      .catch(() => setMsg({ type: 'error', text: 'Failed to load profile.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (newPw && newPw !== confirmPw) {
      return setMsg({ type: 'error', text: 'New passwords do not match.' });
    }

    setSaving(true);
    try {
      const payload = { name, employee_id: username };
      if (newPw) { payload.current_password = currentPw; payload.new_password = newPw; }

      const res = await axios.put(`${API}/employees/admin/profile`, payload, { headers });
      setMsg({ type: 'success', text: res.data.message });

      const updated = res.data.admin;
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, name: updated.name, employee_id: updated.employee_id }));

      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setProfile(prev => ({ ...prev, name: updated.name, employee_id: updated.employee_id }));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="app-container">
      <Sidebar role="admin" />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar role="admin" />
      <div className="main-content">
        <div style={{ maxWidth: '680px' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Admin Profile</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Manage your account credentials and display name.
          </p>

          {msg.text && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
              {msg.text}
            </div>
          )}

          {/* Current profile summary */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', fontWeight: '700', flexShrink: 0 }}>
              {profile?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{profile?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{profile?.employee_id} &nbsp;·&nbsp; Administrator</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{profile?.email || 'No email set'}</div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Display Info */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginBottom: '1.25rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>Account Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Login Username (Employee ID)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. ADM001"
                    required
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Changing your username will require you to log in again with the new ID.
              </p>
            </div>

            {/* Password Change */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>Change Password</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Leave these fields blank if you do not want to change your password.
              </p>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn" disabled={saving} style={{ padding: '0.65rem 2rem' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn-outline" onClick={() => { setName(profile?.name || ''); setUsername(profile?.employee_id || ''); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setMsg({ type: '', text: '' }); }}>
                Discard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
