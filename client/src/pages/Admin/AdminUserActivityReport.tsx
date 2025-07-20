import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';

interface UserActivity {
  name: string;
  email: string;
  lastLogin?: string;
  blocked?: boolean;
  coursesEnrolled: number;
  coursesCompleted: number;
}

const AdminUserActivityReport: React.FC = () => {
  const [data, setData] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/reports/user-activity')
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">User Activity Report</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Last Login</th>
                <th className="px-4 py-2 border">Blocked</th>
                <th className="px-4 py-2 border">Courses Enrolled</th>
                <th className="px-4 py-2 border">Courses Completed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user, idx) => (
                <tr key={idx} className="text-center">
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 border">{user.blocked ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 border">{user.coursesEnrolled}</td>
                  <td className="px-4 py-2 border">{user.coursesCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserActivityReport; 