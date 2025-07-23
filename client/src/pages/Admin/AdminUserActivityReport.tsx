import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';

interface UserInCourse {
  userId: string;
  name: string;
  email: string;
  status: string;
  enrolledAt: string;
}

interface CourseActivity {
  courseId: string;
  courseTitle: string;
  users: UserInCourse[];
}

const AdminUserActivityReport: React.FC = () => {
  const [data, setData] = useState<CourseActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/reports/user-activity')
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">User Activity Report (By Course)</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          {data.length === 0 ? (
            <div className="text-gray-500">No user activity data found.</div>
          ) : (
            data.map((course) => (
              <div key={course.courseId} className="mb-8">
                <h2 className="text-xl font-semibold mb-2">{course.courseTitle}</h2>
                <table className="min-w-full bg-white border rounded shadow mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Enrolled At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.users.length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-gray-400 py-4">No users enrolled.</td></tr>
                    ) : (
                      course.users.map((user) => (
                        <tr key={user.userId} className="text-center">
                          <td className="px-4 py-2 border">{user.name}</td>
                          <td className="px-4 py-2 border">{user.email}</td>
                          <td className="px-4 py-2 border">{user.status}</td>
                          <td className="px-4 py-2 border">{new Date(user.enrolledAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserActivityReport; 