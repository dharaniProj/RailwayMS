import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/employees/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="app-container"><Sidebar role="employee" /><div className="main-content"><h2>Loading Profile...</h2></div></div>;

  return (
    <div className="app-container">
      <Sidebar role="employee" />
      <div className="main-content">
        <h2>My Profile</h2>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>These details were entered by the Administrator during your registration. They are read-only.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Basic Information</h3>
              <p><strong>Employee ID:</strong> {profile.employee_id}</p>
              <p><strong>Full Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone_number || 'N/A'}</p>
              <p><strong>DOB:</strong> {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Gender:</strong> {profile.gender || 'N/A'}</p>
              <p><strong>Marital Status:</strong> {profile.marital_status || 'N/A'}</p>
              {profile.marital_status === 'Married' && <p><strong>Spouse Name:</strong> {profile.spouse_name || 'N/A'}</p>}
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Job Information</h3>
              <p><strong>Department:</strong> {profile.department || 'N/A'}</p>
              <p><strong>Designation:</strong> {profile.designation || 'N/A'}</p>
              <p><strong>Joining Date:</strong> {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Employment Type:</strong> {profile.employment_type || 'N/A'}</p>
              <p><strong>Work Location:</strong> {profile.work_location || 'N/A'}</p>
              <p><strong>Salary:</strong> {profile.salary ? `₹${profile.salary}` : 'N/A'}</p>
              <p><strong>Official Assets:</strong> {profile.official_assets || 'N/A'}</p>
            </section>

            <section style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Identification</h3>
              <p><strong>Aadhaar Number:</strong> {profile.aadhaar_number || 'N/A'}</p>
              <p><strong>PAN Number:</strong> {profile.pan_number || 'N/A'}</p>
              <p><strong>Health Card Number:</strong> {profile.health_card_number || 'N/A'}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;
