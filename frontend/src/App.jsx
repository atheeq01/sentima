import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthContext } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';

const RoleBasedDashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'lecturer') return <LecturerDashboard />;
  if (user.role === 'student') return <StudentDashboard />;

  return <Navigate to="/login" />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<RoleBasedDashboard />} />
  </Routes>
);

export default App;
