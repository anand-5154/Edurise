import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminNavbar from '../components/AdminNavbar';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminTutors from '../pages/Admin/AdminTutors';
import AdminTutorRequests from '../pages/Admin/AdminTutorRequests';
import Courses from '../pages/Admin/Courses';
import Categories from '../pages/Admin/Categories';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminNavbar />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tutors" element={<AdminTutors />} />
        <Route path="tutor-requests" element={<AdminTutorRequests />} />
        <Route path="courses" element={<Courses />} />
        <Route path="categories" element={<Categories />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
