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
import AdminInstructors from "../pages/Admin/AdminInstructors";
import AdminInstructorRequests from "../pages/Admin/AdminInstructorRequests";
import AdminProfile from '../pages/Admin/AdminProfile';
import AdminSettings from '../pages/Admin/AdminSettings';

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
        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="instructor-requests" element={<AdminInstructorRequests />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
