import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  DollarSign, 
  BookOpen, 
  FolderOpen,
  ChevronDown,
  Settings,
  LogOut,
  Bell,
  Home,
  UserPlus,
  Tag
} from 'lucide-react';
import { successToast } from './Toast';
import apiService from '../services/apiService';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<{ name?: string }>({});

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      localStorage.clear();
      window.location.href = '/admin/login';
    } else {
      // Fetch admin profile
      apiService.get('/admin/profile')
        .then(res => setAdminData(res.data))
        .catch(() => setAdminData({ name: 'Admin' }));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    successToast('Logged out successfully');
    window.location.href = '/admin/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Instructors', path: '/admin/instructors', icon: BookOpen },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Categories', path: '/admin/categories', icon: FolderOpen },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 shadow-2xl border-r border-blue-700/30">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-6 border-b border-blue-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-bold text-xl">Admin Panel</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                        isActive
                        ? 'bg-blue-700 bg-opacity-70 text-white shadow-lg border-r-4 border-blue-400'
                        : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50 hover:text-white'
                    } w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group`}
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-blue-700/30 p-4">
            <Link
              to="/admin/settings"
              className="w-full flex items-center space-x-3 px-4 py-3 text-blue-100 hover:text-white hover:bg-blue-700 hover:bg-opacity-50 rounded-lg transition-all duration-200 mb-2"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>

            <Link
              to="/admin/profile"
              className="bg-blue-800 bg-opacity-50 hover:bg-opacity-70 rounded-lg p-3 mb-3 block transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {adminData.name ? adminData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{adminData.name || 'Admin'}</p>
                  <p className="text-blue-200 text-xs">Administrator</p>
                </div>
              </div>
            </Link>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-900 hover:bg-opacity-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminNavbar;