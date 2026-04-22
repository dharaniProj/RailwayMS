import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import API_BASE_URL from '../apiConfig';

const API = `${API_BASE_URL}/api/railwayPass`;

function RailwayPass() {
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Employee State
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    full_name: user.name || '',
    dob: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
    contact_no: user.phone_number || '',
    address: user.work_location || '', // default to work location or empty
    route_from: '',
    route_to: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Admin State
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (role === 'admin') {
      fetchAllApplications();
    } else {
      fetchMyApplications();
    }
  }, [role]);

  const fetchMyApplications = async () => {
    try {
      const res = await axios.get(`${API}/my`, { headers });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      const res = await axios.get(`${API}/admin/all`, { headers });
      setAllApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/apply`, formData, { headers });
      alert('Railway Pass application submitted!');
      setFormData({ ...formData, route_from: '', route_to: '' });
      fetchMyApplications();
    } catch (err) {
      alert('Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API}/admin/${id}/status`, { status: newStatus }, { headers });
      alert(`Status updated to ${newStatus}`);
      fetchAllApplications();
      setSelectedApp(null);
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'In Process': return '#17a2b8';
      case 'On-Hold': return '#6c757d';
      case 'Rejected': return '#dc3545';
      case 'Completed': return '#28a745';
      default: return '#000';
    }
  };

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">
        <h2>🚂 Railway Pass Module</h2>

        {role === 'employee' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="card">
              <h3>Apply for Railway Pass</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                Please fill in your travel details. Basic information is pre-filled from your profile.
              </p>
              <form onSubmit={handleApply}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Contact Number</label>
                    <input type="text" value={formData.contact_no} onChange={e => setFormData({...formData, contact_no: e.target.value})} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Residential Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required rows="2" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Route From (Location)</label>
                    <input type="text" value={formData.route_from} onChange={e => setFormData({...formData, route_from: e.target.value})} placeholder="e.g., Mumbai Central" required />
                  </div>
                  <div className="input-group">
                    <label>Route To (Location)</label>
                    <input type="text" value={formData.route_to} onChange={e => setFormData({...formData, route_to: e.target.value})} placeholder="e.g., Pune Junction" required />
                  </div>
                </div>
                <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', marginTop: '1rem' }}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>

            <div className="card">
              <h3>My Applications</h3>
              {loading ? <p>Loading history...</p> : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {applications.length === 0 ? <p>No applications yet.</p> : (
                    applications.map(app => (
                      <div key={app.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong>{app.route_from} ➔ {app.route_to}</strong>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            backgroundColor: getStatusColor(app.status), 
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            {app.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Applied on: {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <h3>Admin: Railway Pass Applications</h3>
            {loading ? <p>Loading applications...</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem' }}>Photo</th>
                      <th style={{ padding: '1rem' }}>Employee</th>
                      <th style={{ padding: '1rem' }}>Route</th>
                      <th style={{ padding: '1rem' }}>Date</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allApplications.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '0.5rem 1rem' }}>
                          <img 
                            src={app.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.full_name)}&background=random`} 
                            alt="" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600' }}>{app.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.emp_code}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontSize: '0.9rem' }}>{app.route_from} ➔ {app.route_to}</div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            backgroundColor: getStatusColor(app.status), 
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => setSelectedApp(app)} className="btn" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>Review</button>
                        </td>
                      </tr>
                    ))}
                    {allApplications.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No applications found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admin Review Modal */}
        {selectedApp && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
          }}>
            <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Review Application</h3>
                <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>&times;</button>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <img 
                  src={selectedApp.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApp.full_name)}&background=random`} 
                  alt="" 
                  style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} 
                />
                <div>
                  <h4 style={{ margin: 0 }}>{selectedApp.full_name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Employee ID:</strong> {selectedApp.emp_code}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>DOB:</strong> {selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString() : 'N/A'}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Contact:</strong> {selectedApp.contact_no}</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ margin: '4px 0' }}><strong>Address:</strong> {selectedApp.address}</p>
                <p style={{ margin: '4px 0' }}><strong>Route:</strong> {selectedApp.route_from} ➔ {selectedApp.route_to}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleStatusUpdate(selectedApp.id, 'In Process')} className="btn" style={{ backgroundColor: '#17a2b8', flex: 1 }}>In Process</button>
                <button onClick={() => handleStatusUpdate(selectedApp.id, 'On-Hold')} className="btn" style={{ backgroundColor: '#6c757d', flex: 1 }}>On-Hold</button>
                <button onClick={() => handleStatusUpdate(selectedApp.id, 'Rejected')} className="btn" style={{ backgroundColor: '#dc3545', flex: 1 }}>Reject</button>
                <button onClick={() => handleStatusUpdate(selectedApp.id, 'Completed')} className="btn" style={{ backgroundColor: '#28a745', flex: 1 }}>Mark Completed</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RailwayPass;
