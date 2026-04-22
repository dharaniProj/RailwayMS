import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import LeaveCalendar from '../components/LeaveCalendar';

import API_BASE_URL from '../apiConfig';

const API = `${API_BASE_URL}/api`;

function Leaves() {
  const role = localStorage.getItem('role');

  // Employee state
  const [myLeaves, setMyLeaves] = useState([]);
  const [myLeaveCount, setMyLeaveCount] = useState(0);
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applying, setApplying] = useState(false);

  // Admin state
  const [allRequests, setAllRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [empLeaveData, setEmpLeaveData] = useState(null); 
  const [newLeaveCount, setNewLeaveCount] = useState(0);

  // Leave Detail Modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editReason, setEditReason] = useState('');

  const [manualSubject, setManualSubject] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');
  const [recording, setRecording] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (role === 'admin') {
      loadAllRequests();
      loadEmployees();
    } else {
      loadMyLeaves();
    }
  }, [role]);

  const loadMyLeaves = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const [leavesRes, detailRes] = await Promise.all([
        axios.get(`${API}/leaves/me`, { headers }),
        axios.get(`${API}/leaves/employee/${user.id}`, { headers })
      ]);
      setMyLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      setMyLeaveCount(detailRes.data?.leave_count ?? 0);
    } catch (err) {
      console.error('Error loading leaves:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert('Please select start and end dates.');
    setApplying(true);
    try {
      await axios.post(`${API}/leaves/apply`, { subject, reason, start_date: startDate, end_date: endDate }, { headers });
      alert('Leave application submitted!');
      setSubject(''); setReason(''); setStartDate(''); setEndDate('');
      loadMyLeaves();
    } catch (err) {
      alert('Error submitting leave.');
    } finally {
      setApplying(false);
    }
  };

  const loadAllRequests = async () => {
    try {
      const res = await axios.get(`${API}/leaves/requests`, { headers });
      setAllRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees(res.data.filter(e => e.role !== 'admin'));
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this leave request?`)) return;
    try {
      await axios.put(`${API}/leaves/${id}/status`, { status }, { headers });
      loadAllRequests();
    } catch (err) { alert('Error updating status.'); }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Permanently delete this leave record?')) return;
    try {
      await axios.delete(`${API}/leaves/${id}`, { headers });
      alert('Deleted.');
      setSelectedLeave(null);
      loadAllRequests();
      if (selectedEmpId) handleSelectEmployee(selectedEmpId);
    } catch (err) { alert('Error deleting.'); }
  };

  const handleUpdateLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/leaves/${selectedLeave.id}`, { subject: editSubject, reason: editReason }, { headers });
      alert('Updated!');
      setIsEditing(false);
      setSelectedLeave({ ...selectedLeave, subject: editSubject, reason: editReason });
      loadAllRequests();
      if (selectedEmpId) handleSelectEmployee(selectedEmpId);
    } catch (err) { alert('Error updating.'); }
  };

  const handleSelectEmployee = async (empId) => {
    setSelectedEmpId(empId);
    if (!empId) { setEmpLeaveData(null); return; }
    try {
      const res = await axios.get(`${API}/leaves/employee/${empId}`, { headers });
      setEmpLeaveData(res.data);
      setNewLeaveCount(res.data?.leave_count ?? 0);
    } catch (err) { console.error(err); }
  };

  const openLeaveModal = (leave) => {
    setSelectedLeave(leave);
    setEditSubject(leave.subject);
    setEditReason(leave.reason);
    setIsEditing(false);
  };

  const handleManualLeave = async (e) => {
    e.preventDefault();
    setRecording(true);
    try {
      await axios.post(`${API}/leaves/manual-add`, {
        employeeId: selectedEmpId,
        subject: manualSubject, reason: manualReason,
        start_date: manualStartDate, end_date: manualEndDate
      }, { headers });
      alert('Leave recorded!');
      setManualSubject(''); setManualReason(''); setManualStartDate(''); setManualEndDate('');
      handleSelectEmployee(selectedEmpId);
      loadAllRequests();
    } catch (err) { alert('Error recording.'); }
    finally { setRecording(false); }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: { bg: '#fff3cd', color: '#856404' },
      approved: { bg: '#d4edda', color: '#155724' },
      rejected: { bg: '#f8d7da', color: '#721c24' },
    };
    const c = colors[status] || colors.pending;
    return <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', backgroundColor: c.bg, color: c.color }}>{status?.toUpperCase()}</span>;
  };

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">
        <h2>{role === 'admin' ? '🏖 Leave Management' : '🏖 My Leaves'}</h2>

        {selectedLeave && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Leave Details</h3>
                <button onClick={() => setSelectedLeave(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>&times;</button>
              </div>
              
              {isEditing ? (
                <form onSubmit={handleUpdateLeave}>
                  <div className="input-group">
                    <label>Subject</label>
                    <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Reason</label>
                    <textarea value={editReason} onChange={e => setEditReason(e.target.value)} required rows="3" />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn" onClick={() => setIsEditing(false)} style={{ flex: 1, backgroundColor: '#6c757d' }}>Cancel</button>
                    <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
                  </div>
                </form>
              ) : (
                <div>
                  <p><strong>Subject:</strong> {selectedLeave.subject}</p>
                  <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                  <p><strong>Dates:</strong> {new Date(selectedLeave.start_date).toLocaleDateString()} – {new Date(selectedLeave.end_date).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <StatusBadge status={selectedLeave.status} /></p>
                  
                  {role === 'admin' && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <button className="btn" onClick={() => setIsEditing(true)} style={{ flex: 1, backgroundColor: 'var(--primary-blue)' }}>Edit Details</button>
                      <button className="btn" onClick={() => handleDeleteLeave(selectedLeave.id)} style={{ flex: 1, backgroundColor: '#dc3545' }}>Delete Record</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {role === 'employee' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3>Apply for Leave</h3>
                  <div style={{ background: 'var(--primary-blue)', color: 'white', borderRadius: '20px', padding: '4px 16px', fontSize: '0.88rem', fontWeight: '600' }}>Remaining: {myLeaveCount}</div>
                </div>
                <form onSubmit={handleApply}>
                  <div className="input-group"><label>Subject</label><input type="text" value={subject} onChange={e => setSubject(e.target.value)} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group"><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                    <div className="input-group"><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
                  </div>
                  <div className="input-group"><label>Reason</label><textarea value={reason} onChange={e => setReason(e.target.value)} required rows="4" /></div>
                  <button type="submit" className="btn" disabled={applying} style={{ width: '100%' }}>{applying ? 'Submitting...' : 'Apply Leave'}</button>
                </form>
              </div>
              <div className="card">
                <h3>Leave History</h3>
                {myLeaves.map(l => (
                  <div key={l.id} onClick={() => openLeaveModal(l)} style={{ borderBottom: '1px solid #eee', padding: '10px 0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{l.subject}</strong><StatusBadge status={l.status} /></div>
                    <div style={{ fontSize: '0.82rem', color: '#666' }}>{new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card"><h3>Leave Tracker</h3><LeaveCalendar data={myLeaves} onLeaveClick={openLeaveModal} /></div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div className="card">
                <h3>Pending Leave Requests</h3>
                {allRequests.filter(r => r.status === 'pending').map(r => (
                  <div key={r.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{r.employee_name} ({r.employee_code})</strong>
                      <div style={{ fontSize: '0.9rem' }}>{r.subject}: {r.reason}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(r.start_date).toLocaleDateString()} – {new Date(r.end_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <button onClick={() => handleStatusUpdate(r.id, 'approved')} className="btn" style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#28a745' }}>Approve</button>
                      <button onClick={() => handleStatusUpdate(r.id, 'rejected')} className="btn" style={{ padding: '5px 10px', backgroundColor: '#dc3545' }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3>Employee Leave Tracker</h3>
                <div className="input-group">
                  <select value={selectedEmpId} onChange={e => handleSelectEmployee(e.target.value)}>
                    <option value="">-- Select Employee --</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>)}
                  </select>
                </div>
                {empLeaveData && (
                  <div>
                    <LeaveCalendar data={empLeaveData.leaves} onLeaveClick={openLeaveModal} />
                    <div style={{ marginTop: '1.5rem', borderTop: '1px dashed #ccc', paddingTop: '1rem' }}>
                      <h4>Add Manual Leave</h4>
                      <form onSubmit={handleManualLeave}>
                        <div className="input-group"><input type="text" value={manualSubject} onChange={e => setManualSubject(e.target.value)} required placeholder="Subject" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <input type="date" value={manualStartDate} onChange={e => setManualStartDate(e.target.value)} required />
                          <input type="date" value={manualEndDate} onChange={e => setManualEndDate(e.target.value)} required />
                        </div>
                        <input type="text" value={manualReason} onChange={e => setManualReason(e.target.value)} required placeholder="Reason" style={{ marginTop: '0.5rem', width: '100%' }} />
                        <button type="submit" className="btn" disabled={recording} style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#6c757d' }}>{recording ? 'Recording...' : 'Record Leave'}</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>All Leave History</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {allRequests.filter(r => r.status !== 'pending').length === 0 
                  ? <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No processed leaves found.</p>
                  : allRequests.filter(r => r.status !== 'pending').map(r => (
                    <div key={r.id} onClick={() => openLeaveModal(r)} style={{ borderBottom: '1px solid #eee', padding: '12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', transition: 'background 0.2s' }} className="history-item">
                      <div>
                        <strong>{r.employee_name}</strong>: {r.subject} 
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>({new Date(r.start_date).toLocaleDateString()} – {new Date(r.end_date).toLocaleDateString()})</div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <StatusBadge status={r.status} />
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLeave(r.id); }} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }} title="Delete Permanent Record">🗑</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaves;
