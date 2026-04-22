import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(null); // { type: 'delete'|'reset', id, name }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('${API_BASE_URL}/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const confirmAction = async () => {
    if (!confirmDialog) return;
    const { type, id, name } = confirmDialog;
    const token = localStorage.getItem('token');
    
    try {
      if (type === 'delete') {
        await axios.delete(`${API_BASE_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConfirmDialog(null);
        fetchEmployees();
      } else if (type === 'reset') {
        const res = await axios.post(`${API_BASE_URL}/api/employees/${id}/reset-password`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConfirmDialog(null);
        // Show success alert for the new password
        window.alert(`Password reset successfully for ${name}!\n\nNew Password: ${res.data.new_password}`);
      }
    } catch (err) {
      alert(`Error performing action on ${name}`);
      setConfirmDialog(null);
    }
  };

  return (
    <div className="app-container">
      <Sidebar role="admin" />
      <div className="main-content">
        <h2>{getGreeting()}, {user.name || 'Admin'}</h2>
        
        {/* Custom Confirmation Modal */}
        {confirmDialog && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <h3 style={{ color: confirmDialog.type === 'delete' ? 'var(--danger)' : 'var(--primary-blue)' }}>
                Confirm {confirmDialog.type === 'delete' ? 'Deletion' : 'Password Reset'}
              </h3>
              <p>Are you sure you want to {confirmDialog.type === 'delete' ? 'delete' : 'reset the password for'} <strong>{confirmDialog.name}</strong>?</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn" onClick={() => setConfirmDialog(null)} style={{ flex: 1, backgroundColor: 'var(--text-muted)' }}>Cancel</button>
                <button className="btn" onClick={confirmAction} style={{ flex: 1, backgroundColor: confirmDialog.type === 'delete' ? 'var(--danger)' : 'var(--primary-blue)' }}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Dashboard Overview</h3>
            <p>Manage your railway employees and system data.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--primary-blue)' }}>{employees.length}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Total Employees</p>
          </div>
        </div>
        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <Link to="/admin/announcements" className="btn" style={{ textAlign: 'center', textDecoration: 'none' }}>Announcements</Link>
            <Link to="/admin/leaves" className="btn" style={{ textAlign: 'center', textDecoration: 'none' }}>Leaves</Link>
            <Link to="/admin/salary" className="btn" style={{ textAlign: 'center', textDecoration: 'none' }}>Payslips</Link>
            <Link to="/admin/transfers" className="btn" style={{ textAlign: 'center', textDecoration: 'none' }}>Transfers</Link>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Employee Directory</h3>
          {loading ? <p>Loading employees...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.8rem' }}>Emp ID</th>
                    <th style={{ padding: '0.8rem' }}>Name</th>
                    <th style={{ padding: '0.8rem' }}>Department</th>
                    <th style={{ padding: '0.8rem' }}>Designation</th>
                    <th style={{ padding: '0.8rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.8rem' }}>{emp.employee_id}</td>
                      <td style={{ padding: '0.8rem' }}>{emp.name}</td>
                      <td style={{ padding: '0.8rem' }}>{emp.department || 'N/A'}</td>
                      <td style={{ padding: '0.8rem' }}>{emp.designation || 'N/A'}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <button onClick={() => setConfirmDialog({ type: 'reset', id: emp.id, name: emp.name })} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Reset Password</button>
                        <button onClick={() => setConfirmDialog({ type: 'delete', id: emp.id, name: emp.name })} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
