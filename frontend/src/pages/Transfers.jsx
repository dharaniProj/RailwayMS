import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Transfers() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [transfers, setTransfers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);

  // Request Form
  const [toLocation, setToLocation] = useState('');
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  // Admin Manual Transfer
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualToLocation, setManualToLocation] = useState('');
  const [manualEffectiveDate, setManualEffectiveDate] = useState('');
  const [manualReason, setManualReason] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetchRequests();
      fetchEmployees();
    } else {
      fetchMyTransfers();
      fetchMyProfile();
    }
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/transfers/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyTransfers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/transfers/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/employees/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/transfers/request`, { 
        to_location: toLocation, 
        reason, 
        effective_date: effectiveDate 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Transfer request submitted!');
      setToLocation('');
      setReason('');
      setEffectiveDate('');
      fetchMyTransfers();
    } catch (err) {
      alert('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/transfers/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleManualTransfer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/transfers/initiate`, {
        employeeId: manualEmpId,
        to_location: manualToLocation,
        effective_date: manualEffectiveDate,
        reason: manualReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Manual transfer executed!');
      setManualEmpId('');
      setManualToLocation('');
      setManualEffectiveDate('');
      setManualReason('');
      fetchRequests();
    } catch (err) {
      alert('Error executing manual transfer');
    }
  };

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">
        <h2>Transfer Module</h2>

        {role === 'employee' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div className="card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--primary-blue)' }}>
                <h3>Current Posting</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{currentUser.work_location || 'Not Assigned'}</p>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Assigned Department: {currentUser.department}</p>
              </div>

              <div className="card">
                <h3>Request Transfer</h3>
                <form onSubmit={handleRequest}>
                  <div className="input-group">
                    <label>Target Location</label>
                    <input type="text" value={toLocation} onChange={(e) => setToLocation(e.target.value)} required placeholder="Station Name / Division" />
                  </div>
                  <div className="input-group">
                    <label>Preferred Effective Date</label>
                    <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Reason for Transfer</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows="4" placeholder="Personal / Health / Career Growth..."></textarea>
                  </div>
                  <button type="submit" className="btn" disabled={loading}>{loading ? 'Submitting...' : 'Apply for Transfer'}</button>
                </form>
              </div>
            </div>

            <div>
              <div className="card">
                <h3>Transfer History</h3>
                <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                  {transfers.length === 0 ? <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No history found</p> : (
                    transfers.map(t => (
                      <div key={t.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{t.from_location} &rarr; {t.to_location}</span>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Requested on: {new Date(t.created_at).toLocaleDateString()}</div>
                          </div>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '3px 8px', 
                            borderRadius: '12px',
                            backgroundColor: t.status === 'pending' ? '#fff3cd' : t.status === 'approved' ? '#d4edda' : '#f8d7da',
                            color: t.status === 'pending' ? '#856404' : t.status === 'approved' ? '#155724' : '#721c24',
                            fontWeight: 'bold'
                          }}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '8px', fontStyle: 'italic' }}>"{t.reason}"</div>
                        {t.status === 'approved' && <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '5px' }}>Effective from: {new Date(t.effective_date).toLocaleDateString()}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ADMIN VIEW */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <h3>Incoming Transfer Requests</h3>
                <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                  {allRequests.filter(r => r.status === 'pending').map(r => (
                    <div key={r.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{r.employee_name} ({r.employee_code})</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', margin: '4px 0' }}>{r.from_location} &rarr; {r.to_location}</div>
                        </div>
                        <div>
                          <button onClick={() => handleStatusUpdate(r.id, 'approved')} className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem', backgroundColor: '#28a745' }}>Approve</button>
                          <button onClick={() => handleStatusUpdate(r.id, 'rejected')} className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem', backgroundColor: '#dc3545', marginLeft: '5px' }}>Reject</button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}><strong>Reason:</strong> {r.reason}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Requested Date: {new Date(r.effective_date).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {allRequests.filter(r => r.status === 'pending').length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No pending requests</p>}
                </div>
              </div>

              <div className="card">
                <h3>Direct Transfer Initiator</h3>
                <form onSubmit={handleManualTransfer}>
                  <div className="input-group">
                    <label>Select Employee</label>
                    <select value={manualEmpId} onChange={(e) => setManualEmpId(e.target.value)} required>
                      <option value="">Choose Employee...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.employee_id}) - Curr: {e.work_location || 'None'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Target Location</label>
                    <input type="text" value={manualToLocation} onChange={(e) => setManualToLocation(e.target.value)} required placeholder="Enter new station" />
                  </div>
                  <div className="input-group">
                    <label>Effective Date</label>
                    <input type="date" value={manualEffectiveDate} onChange={(e) => setManualEffectiveDate(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Official Reason</label>
                    <input type="text" value={manualReason} onChange={(e) => setManualReason(e.target.value)} required placeholder="Service Requirement / Routine Transfer" />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%' }}>Execute Transfer</button>
                </form>
              </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>Recent Transfer Logs (Global)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Employee</th>
                    <th style={{ padding: '10px' }}>Movement</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests.filter(r => r.status !== 'pending').slice(0, 10).map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{r.employee_name}</td>
                      <td style={{ padding: '10px' }}>{r.from_location} &rarr; {r.to_location}</td>
                      <td style={{ padding: '10px' }}>{new Date(r.effective_date).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          backgroundColor: r.status === 'approved' ? '#d4edda' : '#f8d7da',
                          color: r.status === 'approved' ? '#155724' : '#721c24'
                        }}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transfers;
