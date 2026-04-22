import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(null); 
  const [editEmployee, setEditEmployee] = useState(null); // The employee being edited

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`, { headers });
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
    
    try {
      if (type === 'delete') {
        await axios.delete(`${API_BASE_URL}/api/employees/${id}`, { headers });
        setConfirmDialog(null);
        fetchEmployees();
      } else if (type === 'reset') {
        const res = await axios.post(`${API_BASE_URL}/api/employees/${id}/reset-password`, {}, { headers });
        setConfirmDialog(null);
        window.alert(`Password reset successfully for ${name}!\n\nNew Password: ${res.data.new_password}`);
      }
    } catch (err) {
      alert(`Error performing action on ${name}`);
      setConfirmDialog(null);
    }
  };

  const handleAdminPhotoUpload = async (e, empId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profile_photo', file);

    try {
      await axios.post(`${API_BASE_URL}/api/employees/${empId}/profile-photo`, formData, { 
        headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
      });
      alert('Photo updated successfully!');
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to update photo.');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/employees/${editEmployee.id}`, editEmployee, { headers });
      alert('Employee details updated successfully!');
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      alert('Error updating employee details.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar role="admin" />
      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/logo.png" alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <h2 style={{ margin: 0 }}>{getGreeting()}, {user.name || 'Admin'}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/admin/announcements" style={{ position: 'relative', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2f2f8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span style={{ position: 'absolute', top: -5, right: -5, background: '#ff4d4d', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <img src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'A')}&background=random`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
            </div>
          </div>
        </header>
        
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

        {/* Edit Employee Modal */}
        {editEmployee && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Edit Employee: {editEmployee.name}</h3>
                <button onClick={() => setEditEmployee(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>&times;</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <img 
                  src={editEmployee.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(editEmployee.name)}&size=80&background=random`} 
                  alt="" 
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #ddd' }} 
                />
                <div>
                  <h4 style={{ margin: 0 }}>{editEmployee.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{editEmployee.employee_id} • {editEmployee.designation || 'No Designation'}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateEmployee}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" value={editEmployee.name || ''} onChange={e => setEditEmployee({...editEmployee, name: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" value={editEmployee.email || ''} onChange={e => setEditEmployee({...editEmployee, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Department</label>
                    <input type="text" value={editEmployee.department || ''} onChange={e => setEditEmployee({...editEmployee, department: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Designation</label>
                    <input type="text" value={editEmployee.designation || ''} onChange={e => setEditEmployee({...editEmployee, designation: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Salary (Annual CTC)</label>
                    <input type="number" value={editEmployee.salary || ''} onChange={e => setEditEmployee({...editEmployee, salary: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Leave Count</label>
                    <input type="number" value={editEmployee.leave_count || 0} onChange={e => setEditEmployee({...editEmployee, leave_count: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Work Location</label>
                    <input type="text" value={editEmployee.work_location || ''} onChange={e => setEditEmployee({...editEmployee, work_location: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="text" value={editEmployee.phone_number || ''} onChange={e => setEditEmployee({...editEmployee, phone_number: e.target.value})} />
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setEditEmployee(null)} style={{ flex: 1, backgroundColor: 'var(--text-muted)' }}>Cancel</button>
                  <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
                </div>
              </form>
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
                    <th style={{ padding: '0.8rem' }}>Photo</th>
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
                      <td style={{ padding: '0.5rem 0.8rem' }}>
                        <div style={{ position: 'relative', width: '35px', height: '35px' }}>
                          <img 
                            src={emp.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&size=35&background=random`} 
                            alt="" 
                            style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <label style={{ position: 'absolute', bottom: -2, right: -2, background: 'white', borderRadius: '50%', cursor: 'pointer', display: 'flex', padding: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleAdminPhotoUpload(e, emp.id)} />
                          </label>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem' }}>{emp.employee_id}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span onClick={() => setEditEmployee(emp)} style={{ color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                          {emp.name}
                        </span>
                      </td>
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
                      <td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>No employees found.</td>
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
