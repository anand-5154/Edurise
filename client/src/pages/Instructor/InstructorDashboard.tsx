import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import BeatLoader from "react-spinners/BeatLoader";
import { Users, BookOpen, DollarSign, MessageSquare, Plus } from 'lucide-react';
import { errorToast } from '../../components/Toast';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  totalMessages: number;
  recentCourses: {
    id: string;
    title: string;
    students: number;
    rating: number;
  }[];
  recentMessages: {
    id: string;
    studentName: string;
    message: string;
    timestamp: string;
  }[];
}

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
    totalMessages: 0,
    recentCourses: [],
    recentMessages: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosInstance.get('/instructors/dashboard');
        setStats(response.data);
      } catch (error) {
        // Set default values instead of showing error toast
        setStats({
          totalStudents: 0,
          totalCourses: 0,
          totalEarnings: 0,
          totalMessages: 0,
          recentCourses: [],
          recentMessages: []
        });
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        </div>

        <div className="flex justify-end mb-6">
          <Link to="/instructors/settings" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium">Settings</Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalEarnings}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Messages */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Courses</h2>
            </div>
            <div className="p-6">
              {stats.recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.students} students</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-600">{course.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No recent courses</p>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Messages</h2>
            </div>
            <div className="p-6">
              {stats.recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentMessages.map(message => (
                    <div key={message.id} className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900">{message.studentName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-600 mt-1">{message.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No recent messages</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 