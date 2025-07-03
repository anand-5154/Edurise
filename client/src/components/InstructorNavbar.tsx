import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  DollarSign, 
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  User as UserIcon
} from 'lucide-react';
import axiosInstance from '../services/apiService';
import { successToast } from './Toast';

const InstructorNavbar = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('instructorAccessToken');
    localStorage.removeItem('instructorRefreshToken');
    successToast('Logged out successfully');
    window.location.href = '/instructors/login';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/instructors/dashboard' },
    { name: 'Courses', icon: BookOpen, path: '/instructors/courses' },
    { name: 'Earnings', icon: DollarSign, path: '/instructors/earnings' },
    { name: 'Messages', icon: MessageSquare, path: '/instructors/messages' },
    { name: 'Profile', icon: UserIcon, path: '/instructors/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 shadow-2xl border-r border-purple-700/30">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Instructor Panel</h2>
        </div>
        
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-purple-700/50 text-white'
                    : 'text-purple-100 hover:bg-purple-700/30'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-purple-700/30">
          <Link
            to="/instructors/settings"
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive('/instructors/settings')
                ? 'bg-purple-700/50 text-white'
                : 'text-purple-100 hover:bg-purple-700/30'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
          <button
            className="flex items-center w-full px-4 py-2 mt-4 text-sm font-medium text-purple-100 hover:bg-purple-700/30 rounded-md"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default InstructorNavbar; 