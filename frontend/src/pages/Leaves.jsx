import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import LeaveCalendar from '../components/LeaveCalendar';

const API = 'http://localhost:5000/api';

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
  const [empLeaveData, setEmpLeaveData] = useState(null); // { leaves, leave_count, name }
  const [newLeaveCount, setNewLeaveCount] = useState(0);

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

  /* ─── Employee functions ─── */
  const loadMyLeaves = async () => {
    try {
      const [leavesRes, detailRes] = await Promise.all([
        axios.get(`${API}/leaves/me`, { headers }),
        axios.get(`${API}/leaves/employee/${JSON.parse(localStorage.getItem('user')).id}`, { headers })
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
    if (new Date(endDate) < new Date(startDate)) return alert('End date cannot be before start date.');
    setApplying(true);
    try {
      await axios.post(`${API}/leaves/apply`, { subject, reason, start_date: startDate, end_date: endDate }, { headers });
      alert('Leave application submitted successfully!');
      setSubject(''); setReason(''); setStartDate(''); setEndDate('');
      loadMyLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting leave request.');
    } finally {
      setApplying(false);
    }
  };

  /* ─── Admin functions ─── */
  const loadAllRequests = async () => {
    try {
      const res = await axios.get(`${API}/leaves/requests`, { headers });
      setAllRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading all leave requests:', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees(Array.isArray(res.data) ? res.data.filter(e => e.role !== 'admin') : []);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this leave request?`)) return;
    try {
      await axios.put(`${API}/leaves/${id}/status`, { status }, { headers });
      loadAllRequests();
    } catch (err) {
      alert('Error updating leave status.');
    }
  };

  const handleSelectEmployee = async (empId) => {
    setSelectedEmpId(empId);
    setEmpLeaveData(null);
    if (!empId) return;
    try {
      const res = await axios.get(`${API}/leaves/employee/${empId}`, { headers });
      setEmpLeaveData(res.data);
      setNewLeaveCount(res.data?.leave_count ?? 0);
    } catch (err) {
      console.error('Error loading employee leave details:', err);
    }
  };

  const handleUpdateCount = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/leaves/employee/${selectedEmpId}/count`, { leave_count: newLeaveCount }, { headers });
      alert('Leave count updated!');
      setEmpLeaveData(prev => prev ? { ...prev, leave_count: newLeaveCount } : prev);
    } catch (err) {
      alert('Error updating leave count.');
    }
  };

  /* ─── Status badge helper ─── */
  const StatusBadge = ({ status }) => {
    const colors = {
      pending: { bg: '#fff3cd', color: '#856404' },
      approved: { bg: '#d4edda', color: '#155724' },
      rejected: { bg: '#f8d7da', color: '#721c24' },
    };
    const c = colors[status] || colors.pending;
    return (
      <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', backgroundColor: c.bg, color: c.color }}>
        {status?.toUpperCase()}
      </span>
    );
  };

  /* ─── RENDER ─── */
  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">
        <h2>{role === 'admin' ? '🏖 Leave Management' : '🏖 My Leaves'}</h2>

        {role === 'employee' ? (
          /* ══════ EMPLOYEE VIEW ══════ */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Left column */}
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ margin: 0 }}>Apply for Leave</h3>
                  <div style={{ background: 'var(--primary-blue)', color: 'white', borderRadius: '20px', padding: '4px 16px', fontSize: '0.88rem', fontWeight: '600' }}>
                    Remaining: {myLeaveCount}
                  </div>
                </div>
                <form onSubmit={handleApply}>
                  <div className="input-group">
                    <label>Subject</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. Sick Leave, Personal" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label>Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label>End Date</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Reason</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} required rows="4" placeholder="Explain the reason for your leave..." style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="btn" disabled={applying} style={{ width: '100%', padding: '0.75rem' }}>
                    {applying ? 'Submitting...' : 'Apply Leave'}
                  </button>
                </form>
              </div>

              <div className="card">
                <h3>Leave History</h3>
                {myLeaves.length === 0
                  ? <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>No leave applications yet.</p>
                  : myLeaves.map(l => (
                    <div key={l.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{l.subject}</strong>
                        <StatusBadge status={l.status} />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '4px' }}>
                        {new Date(l.start_date).toLocaleDateString('en-IN')} → {new Date(l.end_date).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Right column — Calendar */}
            <div>
              <div className="card">
                <h3>Leave Tracker</h3>
                <LeaveCalendar data={myLeaves} />
              </div>
            </div>
          </div>
        ) : (
          /* ══════ ADMIN VIEW ══════ */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* Pending requests */}
              <div className="card">
                <h3>Pending Leave Requests</h3>
                {allRequests.filter(r => r.status === 'pending').length === 0
                  ? <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>No pending requests.</p>
                  : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '10px' }}>Employee</th>
                          <th style={{ padding: '10px' }}>Subject</th>
                          <th style={{ padding: '10px' }}>Duration</th>
                          <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allRequests.filter(r => r.status === 'pending').map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '600' }}>{r.employee_name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#888' }}>{r.employee_code}</div>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '600' }}>{r.subject}</div>
                              <div style={{ fontSize: '0.78rem', color: '#666' }}>{r.reason}</div>
                            </td>
                            <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                              {new Date(r.start_date).toLocaleDateString('en-IN')} – {new Date(r.end_date).toLocaleDateString('en-IN')}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <button onClick={() => handleStatusUpdate(r.id, 'approved')} className="btn" style={{ padding: '5px 12px', fontSize: '0.8rem', backgroundColor: '#28a745', marginRight: '6px' }}>✓ Approve</button>
                              <button onClick={() => handleStatusUpdate(r.id, 'rejected')} className="btn" style={{ padding: '5px 12px', fontSize: '0.8rem', backgroundColor: '#dc3545' }}>✗ Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>

              {/* Employee Calendar tracker */}
              <div className="card">
                <h3>Employee Leave Tracker</h3>
                <div className="input-group">
                  <label>Select Employee</label>
                  <select value={selectedEmpId} onChange={e => handleSelectEmployee(e.target.value)}>
                    <option value="">-- Select an employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>
                    ))}
                  </select>
                </div>

                {empLeaveData && (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    <form onSubmit={handleUpdateCount} style={{ backgroundColor: 'rgba(47,47,143,0.05)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                        Leave Allowance for <span style={{ color: 'var(--primary-blue)' }}>{empLeaveData.name}</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="number" min="0" value={newLeaveCount} onChange={e => setNewLeaveCount(e.target.value)} style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <button type="submit" className="btn" style={{ padding: '6px 14px' }}>Update</button>
                      </div>
                    </form>
                    <LeaveCalendar data={empLeaveData.leaves} />
                  </div>
                )}
              </div>
            </div>

            {/* Processed history */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>All Leave History</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Employee</th>
                    <th style={{ padding: '10px' }}>Subject</th>
                    <th style={{ padding: '10px' }}>Dates</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests.filter(r => r.status !== 'pending').slice(0, 15).map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: '600' }}>{r.employee_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>{r.employee_code}</div>
                      </td>
                      <td style={{ padding: '10px' }}>{r.subject}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                        {new Date(r.start_date).toLocaleDateString('en-IN')} – {new Date(r.end_date).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '10px' }}><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                  {allRequests.filter(r => r.status !== 'pending').length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No history yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaves;
