import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/change-password', { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage so we don't trigger this again
      const user = JSON.parse(localStorage.getItem('user'));
      user.is_first_login = false;
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navigate to dashboard
      navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card" style={{ maxWidth: '500px' }}>
        <h2>Welcome! Let's Secure Your Account</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Since this is your first time logging in, please change your auto-generated password to something secure before accessing the dashboard.
        </p>
        
        {error && <div style={{ backgroundColor: 'var(--danger)', color: '#fff', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ textAlign: 'left' }}>
            <label>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              placeholder="Enter new password"
            />
          </div>
          <div className="input-group" style={{ textAlign: 'left' }}>
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Updating...' : 'Change Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
