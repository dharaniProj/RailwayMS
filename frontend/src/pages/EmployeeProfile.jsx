import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/employees/me`, { headers });
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('New passwords do not match.');
    if (newPassword.length < 6) return alert('Password must be at least 6 characters.');
    
    setChanging(true);
    try {
      await axios.post(`${API_BASE_URL}/api/employees/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      }, { headers });
      alert('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing password.');
    } finally {
      setChanging(false);
    }
  };

  if (loading) return <div className="app-container"><Sidebar role="employee" /><div className="main-content"><h2>Loading Profile...</h2></div></div>;

  return (
    <div className="app-container">
      <Sidebar role="employee" />
      <div className="main-content">
        <h2>My Profile</h2>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>These details were entered by the Administrator during your registration. They are read-only.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
            <img 
              src={profile?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=120&background=2f2f8f&color=fff`} 
              alt="Profile" 
              style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '4px solid #eee' }} 
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary-blue)' }}>{profile?.name}</h3>
              <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: '#666' }}>{profile?.designation} — {profile?.employee_id}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Basic Information</h3>
              <p><strong>Employee ID:</strong> {profile?.employee_id}</p>
              <p><strong>Full Name:</strong> {profile?.name}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Phone:</strong> {profile?.phone_number || 'N/A'}</p>
              <p><strong>DOB:</strong> {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Gender:</strong> {profile?.gender || 'N/A'}</p>
              <p><strong>Marital Status:</strong> {profile?.marital_status || 'N/A'}</p>
              {profile?.marital_status === 'Married' && <p><strong>Spouse Name:</strong> {profile?.spouse_name || 'N/A'}</p>}
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Job Information</h3>
              <p><strong>Department:</strong> {profile?.department || 'N/A'}</p>
              <p><strong>Designation:</strong> {profile?.designation || 'N/A'}</p>
              <p><strong>Joining Date:</strong> {profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Employment Type:</strong> {profile?.employment_type || 'N/A'}</p>
              <p><strong>Work Location:</strong> {profile?.work_location || 'N/A'}</p>
              <p><strong>Salary:</strong> {profile?.salary ? `₹${profile.salary}` : 'N/A'}</p>
              <p><strong>Official Assets:</strong> {profile?.official_assets || 'N/A'}</p>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Identification</h3>
              <p><strong>Aadhaar Number:</strong> {profile?.aadhaar_number || 'N/A'}</p>
              <p><strong>PAN Number:</strong> {profile?.pan_number || 'N/A'}</p>
              <p><strong>Health Card Number:</strong> {profile?.health_card_number || 'N/A'}</p>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Security</h3>
              <form onSubmit={handleChangePassword}>
                <div className="input-group">
                  <label>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn" disabled={changing} style={{ width: '100%', backgroundColor: '#6c757d' }}>
                  {changing ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;
