import API_BASE_URL from '../apiConfig';
import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function RegisterEmployee() {
  const [formData, setFormData] = useState({
    employee_id: '', name: '', email: '', role: 'employee',
    phone_number: '', date_of_birth: '', gender: '', marital_status: '', spouse_name: '',
    department: '', designation: '', joining_date: '', employment_type: '', work_location: '',
    salary: '', official_assets: '', aadhaar_number: '', pan_number: '', health_card_number: ''
  });

  const [files, setFiles] = useState({
    profile_photo: null,
    health_card: null,
    other_documents: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'other_documents') {
      setFiles({ ...files, other_documents: e.target.files });
    } else {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const data = new FormData();

    // Append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // We are deliberately NOT appending the files to the FormData here.
    // This makes the file uploads function as "dummies" that are discarded,
    // sending only the user data to the backend as requested by the user.

    try {
      const res = await axios.post(`${API_BASE_URL}/api/employees/register`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessData({
        username: res.data.username,
        password: res.data.generated_password
      });

      setFormData({
        employee_id: '', name: '', email: '', role: 'employee',
        phone_number: '', date_of_birth: '', gender: '', marital_status: '', spouse_name: '',
        department: '', designation: '', joining_date: '', employment_type: '', work_location: '',
        salary: '', official_assets: '', aadhaar_number: '', pan_number: '', health_card_number: ''
      });
      // reset file inputs manually if needed using refs, but omitting for simplicity
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar role="admin" />
      <div className="main-content">
        <h2>Register Employee</h2>
        
        {/* Custom Success Modal */}
        {successData && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--success)' }}>Employee Created Successfully!</h3>
              <p>Please note down these credentials. They are required for the employee to log in.</p>
              <div style={{ backgroundColor: '#f0f4f8', padding: '1rem', borderRadius: '4px', margin: '1rem 0', textAlign: 'left' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Username:</strong> {successData.username}</p>
                <p style={{ margin: 0 }}><strong>Password:</strong> {successData.password}</p>
              </div>
              <button className="btn" onClick={() => setSuccessData(null)} style={{ width: '100%' }}>Done</button>
            </div>
          </div>
        )}

        <div className="card">
          {error && <div style={{ backgroundColor: 'var(--danger)', color: '#fff', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
            
            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>1. Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Employee ID *</label>
                  <input type="text" name="employee_id" value={formData.employee_id} onChange={handleInputChange} required />
                </div>
                <div className="input-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="input-group">
                  <label>Email ID *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Marital Status</label>
                  <select name="marital_status" value={formData.marital_status} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
                {formData.marital_status === 'Married' && (
                  <div className="input-group">
                    <label>Spouse Name</label>
                    <input type="text" name="spouse_name" value={formData.spouse_name} onChange={handleInputChange} />
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>2. Job Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Joining Date</label>
                  <input type="date" name="joining_date" value={formData.joining_date} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Employment Type</label>
                  <select name="employment_type" value={formData.employment_type} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Work Location (Station / Zone)</label>
                  <input type="text" name="work_location" value={formData.work_location} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Salary</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Official Assets (e.g. Lenovo ideapad, MACBook pro)</label>
                  <textarea name="official_assets" value={formData.official_assets} onChange={handleInputChange} rows="3" />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>3. Login Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    * The Username will be the Employee ID.<br/>
                    * The Password will be automatically generated as (First Name) + @ + (Birth Year) and displayed after registration.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>4. Identification Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Aadhaar Number (or Govt ID)</label>
                  <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>PAN Number</label>
                  <input type="text" name="pan_number" value={formData.pan_number} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Health Card Number</label>
                  <input type="text" name="health_card_number" value={formData.health_card_number} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Upload Health Card Document</label>
                  <input type="file" name="health_card" onChange={handleFileChange} />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>5. Profile Information</h3>
              <div className="input-group">
                <label>Profile Photo</label>
                <input type="file" name="profile_photo" onChange={handleFileChange} accept="image/*" />
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>6. Other Documents Upload</h3>
              <div className="input-group">
                <label>Upload Additional Documents (Multiple)</label>
                <input type="file" name="other_documents" onChange={handleFileChange} multiple />
              </div>
            </section>

            <button type="submit" className="btn" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem' }}>
              {loading ? 'Registering...' : 'Register Employee'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterEmployee;
