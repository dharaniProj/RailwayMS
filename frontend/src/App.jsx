import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import RegisterEmployee from './pages/RegisterEmployee';
import ChangePassword from './pages/ChangePassword';
import EmployeeProfile from './pages/EmployeeProfile';
import Announcements from './pages/Announcements';
import AdminSalary from './pages/AdminSalary';
import EmployeeSalary from './pages/EmployeeSalary';
import Leaves from './pages/Leaves';
import Transfers from './pages/Transfers';
import Documents from './pages/Documents';
import AdminProfile from './pages/AdminProfile';
import RailwayPass from './pages/RailwayPass';

// ProtectedRoute evaluates localStorage exactly when the route is matched
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  // Enforce password change for first-time employee login
  if (user.role === 'employee' && user.is_first_login && location.pathname !== '/employee/change-password') {
    return <Navigate to="/employee/change-password" />;
  }

  // Prevent accessing change-password if not first login
  if (user.role === 'employee' && !user.is_first_login && location.pathname === '/employee/change-password') {
    return <Navigate to="/employee" />;
  }

  return children;
};

// Component to handle the root "/" route redirect dynamically
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'employee') {
    return user.is_first_login ? <Navigate to="/employee/change-password" /> : <Navigate to="/employee" />;
  }
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/register-employee" element={<ProtectedRoute role="admin"><RegisterEmployee /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><Announcements /></ProtectedRoute>} />
        <Route path="/admin/salary" element={<ProtectedRoute role="admin"><AdminSalary /></ProtectedRoute>} />
        <Route path="/admin/leaves" element={<ProtectedRoute role="admin"><Leaves /></ProtectedRoute>} />
        <Route path="/admin/transfers" element={<ProtectedRoute role="admin"><Transfers /></ProtectedRoute>} />
        <Route path="/admin/documents" element={<ProtectedRoute role="admin"><Documents /></ProtectedRoute>} />
        <Route path="/admin/railway-pass" element={<ProtectedRoute role="admin"><RailwayPass /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
        
        {/* Employee Routes */}
        <Route path="/employee/change-password" element={<ProtectedRoute role="employee"><ChangePassword /></ProtectedRoute>} />
        <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/profile" element={<ProtectedRoute role="employee"><EmployeeProfile /></ProtectedRoute>} />
        <Route path="/employee/announcements" element={<ProtectedRoute role="employee"><Announcements /></ProtectedRoute>} />
        <Route path="/employee/salary" element={<ProtectedRoute role="employee"><EmployeeSalary /></ProtectedRoute>} />
        <Route path="/employee/leaves" element={<ProtectedRoute role="employee"><Leaves /></ProtectedRoute>} />
        <Route path="/employee/transfers" element={<ProtectedRoute role="employee"><Transfers /></ProtectedRoute>} />
        <Route path="/employee/documents" element={<ProtectedRoute role="employee"><Documents /></ProtectedRoute>} />
        <Route path="/employee/railway-pass" element={<ProtectedRoute role="employee"><RailwayPass /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
