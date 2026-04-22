import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

import API_BASE_URL from '../apiConfig';

const API = `${API_BASE_URL}/api`;

const CATEGORIES = ['All', 'Salary', 'Leave', 'ID Proof', 'Transfer', 'Work', 'Other'];
const CATEGORY_COLORS = {
  Salary:    { bg: '#e8f5e9', color: '#2e7d32' },
  Leave:     { bg: '#e3f2fd', color: '#1565c0' },
  'ID Proof':{ bg: '#fce4ec', color: '#880e4f' },
  Transfer:  { bg: '#fff3e0', color: '#e65100' },
  Work:      { bg: '#f3e5f5', color: '#6a1b9a' },
  Other:     { bg: '#f5f5f5', color: '#424242' },
};

const FILE_ICONS = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'image/jpeg': '🖼',
  'image/png': '🖼',
};

function fileExtLabel(mime) {
  const map = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
  };
  return map[mime] || mime;
}

function formatBytes(bytes) {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryBadge
// ─────────────────────────────────────────────────────────────────────────────
const CategoryBadge = ({ category }) => {
  const style = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: '600', padding: '2px 9px',
      borderRadius: '12px', backgroundColor: style.bg, color: style.color,
      letterSpacing: '0.2px',
    }}>
      {category}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DocumentCard
// ─────────────────────────────────────────────────────────────────────────────
const DocumentCard = ({ doc, onDelete, isAdmin }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.9rem 1.2rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'box-shadow 0.2s',
  }}>
    {/* File type icon */}
    <div style={{
      width: '44px', height: '44px', borderRadius: '10px',
      background: '#f0f4ff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
    }}>
      {FILE_ICONS[doc.file_type] || '📎'}
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: '600', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {doc.title}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>
        {doc.file_name} &nbsp;·&nbsp; {fileExtLabel(doc.file_type)} &nbsp;·&nbsp; {formatBytes(doc.file_size)}
      </div>
      {isAdmin && (
        <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>
          {doc.employee_name} ({doc.employee_code})
        </div>
      )}
    </div>

    <CategoryBadge category={doc.category} />

    <div style={{ fontSize: '0.75rem', color: '#bbb', minWidth: '85px', textAlign: 'right' }}>
      {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
      <a
        href={doc.file_url}
        target="_blank"
        rel="noopener noreferrer"
        download
        style={{
          padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
          background: 'var(--primary-blue)', color: 'white', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download
      </a>
      {isAdmin && (
        <button
          onClick={() => onDelete(doc.doc_id, doc.title)}
          style={{
            padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
            background: '#fff0f0', color: '#dc3545', border: '1px solid #ffc9c9', cursor: 'pointer',
          }}
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
function Documents() {
  const role = localStorage.getItem('role');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin: selected employee for viewing
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadEmpId, setUploadEmpId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Other');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (role === 'admin') {
      loadEmployees();
      loadAllDocuments();
    } else {
      loadMyDocuments();
    }
  }, [role]);

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees((res.data || []).filter(e => e.role !== 'admin'));
    } catch (err) { console.error(err); }
  };

  const loadAllDocuments = async (empId, cat) => {
    setLoading(true);
    try {
      let url = `${API}/documents/all`;
      const params = [];
      if (empId) params.push(`emp_id=${empId}`);
      if (cat && cat !== 'All') params.push(`category=${cat}`);
      if (params.length) url += '?' + params.join('&');
      const res = await axios.get(url, { headers });
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadMyDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/documents/${currentUser.id}`, { headers });
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Delete document "${title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/documents/${docId}`, { headers });
      setDocuments(prev => prev.filter(d => d.doc_id !== docId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!uploadFile) return setUploadError('Please select a file.');
    if (!uploadTitle.trim()) return setUploadError('Please enter a document title.');
    if (role === 'admin' && !uploadEmpId) return setUploadError('Please select an employee.');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('category', uploadCategory);
      formData.append('emp_id', role === 'admin' ? uploadEmpId : currentUser.id);

      await axios.post(`${API}/documents/upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });

      // Reset form
      setUploadTitle('');
      setUploadCategory('Other');
      setUploadFile(null);
      setUploadEmpId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadForm(false);

      // Reload
      if (role === 'admin') loadAllDocuments(selectedEmpId || undefined);
      else loadMyDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Check file type and size.');
    } finally {
      setUploading(false);
    }
  };

  const handleEmpFilter = (empId) => {
    setSelectedEmpId(empId);
    loadAllDocuments(empId || undefined, categoryFilter !== 'All' ? categoryFilter : undefined);
  };

  const handleCatFilter = (cat) => {
    setCategoryFilter(cat);
    if (role === 'admin') loadAllDocuments(selectedEmpId || undefined, cat !== 'All' ? cat : undefined);
  };

  // Client-side search filter
  const filtered = documents.filter(d => {
    const matchSearch = !searchQuery
      || d.title.toLowerCase().includes(searchQuery.toLowerCase())
      || d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      || (d.employee_name && d.employee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = categoryFilter === 'All' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-content">

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>{role === 'admin' ? 'Document Management' : 'My Documents'}</h2>
            <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.88rem' }}>
              {role === 'admin'
                ? 'Upload, view and manage employee documents stored in the cloud.'
                : 'Upload and download your official documents.'}
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(v => !v)}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.4rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload Document
          </button>
        </div>

        {showUploadForm && (
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-blue)', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ margin: '0 0 1.2rem 0' }}>{role === 'admin' ? 'Upload Document for Employee' : 'Upload Your Document'}</h3>
            {uploadError && (
              <div style={{
                background: uploadError.toLowerCase().includes('cloudinary') ? '#fff8e1' : '#fff0f0',
                border: `1px solid ${uploadError.toLowerCase().includes('cloudinary') ? '#ffe082' : '#ffc9c9'}`,
                color: uploadError.toLowerCase().includes('cloudinary') ? '#e65100' : '#dc3545',
                padding: '0.8rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.88rem', lineHeight: '1.6',
              }}>
                {uploadError.toLowerCase().includes('cloudinary') ? (
                  <>
                    <strong>Cloudinary not configured.</strong><br />
                    Add your credentials to <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '3px' }}>backend/.env</code>:<br />
                    <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.82rem' }}>
                      CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
                    </code><br />
                    Get them from <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: '600' }}>cloudinary.com/console</a> then restart the server.
                  </>
                ) : uploadError}
              </div>
            )}
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {role === 'admin' && (
                  <div className="input-group">
                    <label>Employee <span style={{ color: 'red' }}>*</span></label>
                    <select value={uploadEmpId} onChange={e => setUploadEmpId(e.target.value)} required>
                      <option value="">-- Select employee --</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="input-group">
                  <label>Document Title <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. April 2026 Payslip" required />
                </div>
                <div className="input-group">
                  <label>Category <span style={{ color: 'red' }}>*</span></label>
                  <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>File <span style={{ color: 'red' }}>*</span> <span style={{ color: '#aaa', fontSize: '0.78rem' }}>(PDF, DOC, DOCX, JPG, PNG — max 5 MB)</span></label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => setUploadFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                    style={{ padding: '0.4rem' }}
                  />
                </div>
              </div>
              {uploadFile && (
                <div style={{ background: '#f8f9fc', borderRadius: '6px', padding: '0.6rem 1rem', marginTop: '0.5rem', fontSize: '0.83rem', color: '#555' }}>
                  Selected: <strong>{uploadFile.name}</strong> &nbsp;·&nbsp; {formatBytes(uploadFile.size)}
                  {uploadFile.size > 5 * 1024 * 1024 && <span style={{ color: 'red', marginLeft: '8px' }}> File exceeds 5 MB limit!</span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
                <button type="button" onClick={() => { setShowUploadForm(false); setUploadError(''); }} className="btn" style={{ background: '#6c757d' }}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {uploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Row */}
        <div className="card" style={{ padding: '1rem 1.2rem', marginBottom: '1.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Employee filter — admin only */}
          {role === 'admin' && (
            <select
              value={selectedEmpId}
              onChange={e => handleEmpFilter(e.target.value)}
              style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.88rem', minWidth: '200px' }}
            >
              <option value="">All Employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>
              ))}
            </select>
          )}

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCatFilter(cat)}
                style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                  cursor: 'pointer', border: 'none',
                  background: categoryFilter === cat ? 'var(--primary-blue)' : '#f0f0f0',
                  color: categoryFilter === cat ? 'white' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '0.45rem 0.8rem 0.45rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.88rem', width: '200px' }}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#888' }}>
          <span>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
          {categoryFilter !== 'All' && <span>in <strong>{categoryFilter}</strong></span>}
          {selectedEmpId && role === 'admin' && (
            <span>for <strong>{employees.find(e => e.id === parseInt(selectedEmpId))?.name || '...'}</strong></span>
          )}
        </div>

        {/* Document list */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
            <div style={{ fontSize: '0.95rem' }}>Loading documents...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <svg style={{ marginBottom: '1rem', opacity: 0.25 }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2f2f8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p style={{ fontSize: '0.95rem', color: '#aaa', margin: 0 }}>
              {role === 'admin' ? 'No documents found. Upload one using the button above.' : 'No documents available.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map(doc => (
              <DocumentCard key={doc.doc_id} doc={doc} onDelete={handleDelete} isAdmin={role === 'admin'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;
