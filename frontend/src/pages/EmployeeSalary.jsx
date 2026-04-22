import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
// Note: As per request, the PDF generation button will ONLY be in the Admin panel.
// The employee can only VIEW their salary details.

function EmployeeSalary() {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const profileRes = await axios.get('http://localhost:5000/api/employees/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        const historyRes = await axios.get('http://localhost:5000/api/salary/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalaryHistory(historyRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate predefined monthly breakdown based on annual salary
  const annualSalary = profile?.salary ? parseFloat(profile.salary) : 0;
  const monthlySalary = annualSalary / 12;
  const basicPay = monthlySalary * 0.50;
  const hra = monthlySalary * 0.20;
  const allowances = monthlySalary * 0.30;
  const deductions = basicPay * 0.12;
  const netSalary = (basicPay + hra + allowances) - deductions;

  return (
    <div className="app-container">
      <Sidebar role="employee" />
      <div className="main-content">
        <h2>My Salary Details</h2>
        
        {loading ? <p>Loading details...</p> : (
          <>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Predefined Monthly Breakdown</h3>
              {annualSalary > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}><strong>Earnings</strong></p>
                    <p>Basic Pay: <span style={{ float: 'right' }}>₹{basicPay.toFixed(2)}</span></p>
                    <p>HRA: <span style={{ float: 'right' }}>₹{hra.toFixed(2)}</span></p>
                    <p>Allowances: <span style={{ float: 'right' }}>₹{allowances.toFixed(2)}</span></p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}><strong>Deductions</strong></p>
                    <p>Provident Fund (PF): <span style={{ float: 'right' }}>₹{deductions.toFixed(2)}</span></p>
                  </div>
                  <div style={{ gridColumn: '1 / -1', backgroundColor: 'rgba(47,47,143,0.05)', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', color: 'var(--primary-blue)' }}>
                      Estimated Net Salary: <span>₹{netSalary.toFixed(2)}</span>
                    </h3>
                  </div>
                </div>
              ) : (
                <p>No salary configuration found. Please contact the administrator.</p>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Salary History</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                Note: Read-only copy of your salary history. Contact admin for official payslip PDFs.
              </p>
              
              {salaryHistory.length === 0 ? <p>No salary records found.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '0.8rem' }}>Month/Year</th>
                        <th style={{ padding: '0.8rem' }}>Basic Pay</th>
                        <th style={{ padding: '0.8rem' }}>HRA</th>
                        <th style={{ padding: '0.8rem' }}>Allowances</th>
                        <th style={{ padding: '0.8rem' }}>Deductions</th>
                        <th style={{ padding: '0.8rem' }}>Net Salary</th>
                        <th style={{ padding: '0.8rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryHistory.map(record => (
                        <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{record.month_year}</td>
                          <td style={{ padding: '0.8rem' }}>₹{parseFloat(record.basic_pay).toFixed(2)}</td>
                          <td style={{ padding: '0.8rem' }}>₹{parseFloat(record.hra).toFixed(2)}</td>
                          <td style={{ padding: '0.8rem' }}>₹{parseFloat(record.allowances).toFixed(2)}</td>
                          <td style={{ padding: '0.8rem', color: 'var(--danger)' }}>-₹{parseFloat(record.deductions).toFixed(2)}</td>
                          <td style={{ padding: '0.8rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{parseFloat(record.net_salary).toFixed(2)}</td>
                          <td style={{ padding: '0.8rem' }}>
                            <span style={{ backgroundColor: 'rgba(40,167,69,0.1)', color: 'var(--success)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                              {record.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmployeeSalary;
