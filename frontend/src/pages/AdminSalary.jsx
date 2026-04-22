import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { generatePayslipPDF, generateAnnualPayslipPDF } from '../utils/pdfGenerator';

import API_BASE_URL from '../apiConfig';

const API = `${API_BASE_URL}/api`;
const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AdminSalary() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Salary edit modal
  const [editSalaryModal, setEditSalaryModal] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const [savingSalary, setSavingSalary] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees((res.data || []).filter(e => e.role !== 'admin'));
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const selectEmployee = async (emp) => {
    setSelectedEmp(emp);
    setSalaryHistory([]);
    try {
      const res = await axios.get(`${API}/salary/${emp.id}`, { headers });
      setSalaryHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading salary history:', err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedEmp) return;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const monthYear = `${months[now.getMonth()]} ${now.getFullYear()}`;
    if (salaryHistory.some(s => s.month_year === monthYear)) {
      if (!window.confirm(`Payslip for ${monthYear} already exists. Generate again?`)) return;
    }
    setGenerating(true);
    try {
      await axios.post(`${API}/salary/${selectedEmp.id}`, { month_year: monthYear }, { headers });
      const res = await axios.get(`${API}/salary/${selectedEmp.id}`, { headers });
      setSalaryHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating payslip.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    if (!newSalary || isNaN(newSalary) || parseFloat(newSalary) <= 0) {
      return alert('Please enter a valid annual salary.');
    }
    setSavingSalary(true);
    try {
      const res = await axios.put(`${API}/employees/${selectedEmp.id}/salary`, { salary: newSalary }, { headers });
      // Update locally
      const updated = { ...selectedEmp, salary: res.data.employee.salary };
      setSelectedEmp(updated);
      setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      setEditSalaryModal(false);
      setNewSalary('');
      alert('Salary updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating salary.');
    } finally {
      setSavingSalary(false);
    }
  };

  const handleDownloadMonthly = (record) => {
    try { generatePayslipPDF(selectedEmp, record); }
    catch (e) { alert('PDF generation failed. Check console.'); }
  };

  const handleDownloadAnnual = () => {
    if (salaryHistory.length === 0) return alert('No salary records found for annual statement.');
    try { generateAnnualPayslipPDF(selectedEmp, salaryHistory); }
    catch (e) { alert('PDF generation failed. Check console.'); }
  };

  // Live computed breakdown
  const computeBreakdown = (annualSalary) => {
    const annual = parseFloat(annualSalary || 0);
    const monthly = annual / 12;
    const basic = monthly * 0.50;
    const hra = monthly * 0.20;
    const allowances = monthly * 0.30;
    const deductions = basic * 0.12;
    const net = basic + hra + allowances - deductions;
    return { annual, monthly, basic, hra, allowances, deductions, net };
  };

  const bd = selectedEmp ? computeBreakdown(selectedEmp.salary) : null;

  return (
    <div className="app-container">
      <Sidebar role="admin" />
      <div className="main-content">
        <h2>Salary & Payslip Management</h2>

        {/* Employee Directory */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Employee Directory</h3>
          {pageLoading ? <p>Loading employees...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem 1rem' }}>Emp ID</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Designation</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Annual Salary</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr
                      key={emp.id}
                      style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: selectedEmp?.id === emp.id ? 'rgba(47,47,143,0.06)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#888' }}>{emp.employee_id}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: '600' }}>{emp.name}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.88rem' }}>{emp.designation || 'N/A'}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.88rem' }}>{emp.department || 'N/A'}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: '600', color: emp.salary ? 'var(--success)' : 'var(--danger)' }}>
                        {emp.salary ? `₹ ${parseFloat(emp.salary).toLocaleString('en-IN')}` : 'Not Set'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <button onClick={() => selectEmployee(emp)} className="btn" style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No employees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Employee Details */}
        {selectedEmp && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {/* Header bar */}
            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary-blue), #4a4ab8)', color: 'white', padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{selectedEmp.name}</div>
                  <div style={{ fontSize: '0.88rem', opacity: 0.85 }}>{selectedEmp.employee_id} &nbsp;|&nbsp; {selectedEmp.designation || 'N/A'} &nbsp;|&nbsp; {selectedEmp.department || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '6px', opacity: 0.8 }}>Work Location: {selectedEmp.work_location || 'N/A'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setNewSalary(selectedEmp.salary || ''); setEditSalaryModal(true); }}
                    style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}
                  >
                    Edit Salary
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{ background: '#28a745', border: 'none', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.88rem', opacity: generating ? 0.7 : 1 }}
                  >
                    {generating ? 'Generating...' : 'Generate This Month'}
                  </button>
                  <button
                    onClick={handleDownloadAnnual}
                    style={{ background: '#fd7e14', border: 'none', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}
                  >
                    Download Annual Statement
                  </button>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            {bd && bd.annual > 0 ? (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                  Monthly Salary Breakdown
                  <span style={{ fontSize: '0.85rem', fontWeight: '400', color: '#888', marginLeft: '1rem' }}>
                    Annual: ₹ {parseFloat(selectedEmp.salary).toLocaleString('en-IN')}
                  </span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Basic Pay', value: bd.basic, color: 'var(--primary-blue)', sub: '50% of monthly' },
                    { label: 'HRA', value: bd.hra, color: '#0077b6', sub: '20% of monthly' },
                    { label: 'Allowances', value: bd.allowances, color: '#4cc9f0', sub: '30% of monthly' },
                    { label: 'PF Deduction', value: bd.deductions, color: 'var(--danger)', sub: '12% of basic' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8f9fc', borderRadius: '8px', padding: '1rem', borderTop: `3px solid ${item.color}` }}>
                      <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: item.color }}>₹ {fmt(item.value)}</div>
                      <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(47,47,143,0.06), rgba(47,47,143,0.12))', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>Estimated Monthly Net Salary</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-blue)' }}>₹ {fmt(bd.net)}</span>
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
                <p style={{ color: 'var(--danger)', margin: 0 }}>Annual salary not configured. Click "Edit Salary" to set it.</p>
              </div>
            )}

            {/* Salary History */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>Salary History</h3>
              {salaryHistory.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No payslip records yet. Click "Generate This Month" to create one.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Month / Year</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Basic Pay</th>
                      <th style={{ padding: '0.75rem 1rem' }}>HRA</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Allowances</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Deductions</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Net Salary</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryHistory.map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{record.month_year}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>₹ {fmt(record.basic_pay)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>₹ {fmt(record.hra)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>₹ {fmt(record.allowances)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--danger)' }}>- ₹ {fmt(record.deductions)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--success)' }}>₹ {fmt(record.net_salary)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: 'rgba(40,167,69,0.12)', color: '#155724', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {(record.status || 'paid').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button onClick={() => handleDownloadMonthly(record)} className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Salary Modal */}
      {editSalaryModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '420px', maxWidth: '95vw', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
              Edit Annual Salary
            </h3>
            <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
              Employee: <strong>{selectedEmp?.name}</strong> ({selectedEmp?.employee_id})
            </p>
            <form onSubmit={handleUpdateSalary}>
              <div className="input-group">
                <label>Annual Salary (INR)</label>
                <input
                  type="number"
                  value={newSalary}
                  onChange={e => setNewSalary(e.target.value)}
                  placeholder="e.g. 600000"
                  min="1"
                  required
                  style={{ fontSize: '1rem' }}
                />
              </div>
              {newSalary > 0 && (
                <div style={{ background: '#f8f9fc', borderRadius: '6px', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#555' }}>
                  Monthly: <strong>₹ {fmt(parseFloat(newSalary) / 12)}</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
                  Net/month: <strong>₹ {fmt(computeBreakdown(newSalary).net)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditSalaryModal(false)} className="btn" style={{ flex: 1, background: '#6c757d' }}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={savingSalary} style={{ flex: 1 }}>
                  {savingSalary ? 'Saving...' : 'Update Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSalary;
