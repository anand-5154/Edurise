import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';
import AdminTable, { type Column } from '../../components/AdminTable';

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

interface TopUser {
  _id: string;
  name: string;
  email: string;
  totalEnrollments?: number;
  completedEnrollmentsCount?: number;
}

const userColumns: Column<UserInCourse>[] = [
  { label: 'Name', accessor: 'name', className: 'px-4 py-2 border' },
  { label: 'Email', accessor: 'email', className: 'px-4 py-2 border' },
  { label: 'Status', accessor: 'status', className: 'px-4 py-2 border' },
  { label: 'Enrolled At', accessor: 'enrolledAt', className: 'px-4 py-2 border', render: (value) => new Date(value).toLocaleString() },
];

const UserCard = ({ user, type }: { user: TopUser; type: 'enrolled' | 'completed' }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-700 mb-2">
      {user.name?.[0]?.toUpperCase() || '?'}
    </div>
    <div className="font-semibold text-gray-800 text-lg text-center">{user.name}</div>
    <div className="text-gray-500 text-sm text-center mb-1">{user.email}</div>
    <div className="mt-2 text-purple-700 font-bold text-xl">
      {type === 'enrolled' && <>{user.totalEnrollments} <span className="text-xs font-normal text-gray-500">enrollments</span></>}
      {type === 'completed' && <>{user.completedEnrollmentsCount} <span className="text-xs font-normal text-gray-500">completions</span></>}
    </div>
  </div>
);

const AdminUserActivityReport: React.FC = () => {
  const [data, setData] = useState<CourseActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [topEnrolled, setTopEnrolled] = useState<TopUser[]>([]);
  const [topCompleted, setTopCompleted] = useState<TopUser[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/reports/user-activity')
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTrendsLoading(true);
    axiosInstance.get('/admin/reports/user-trends')
      .then(res => {
        setTopEnrolled(res.data.topEnrolled || []);
        setTopCompleted(res.data.topCompleted || []);
      })
      .catch(() => {
        setTopEnrolled([]);
        setTopCompleted([]);
      })
      .finally(() => setTrendsLoading(false));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">User Activity Report (By Course)</h1>
      {/* Top Users Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Top Enrollers</h2>
          {trendsLoading ? (
            <div>Loading...</div>
          ) : topEnrolled.length === 0 ? (
            <div className="text-gray-500">No data found.</div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {topEnrolled.map(user => <UserCard key={user._id} user={user} type="enrolled" />)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-700">Top Completers</h2>
          {trendsLoading ? (
            <div>Loading...</div>
          ) : topCompleted.length === 0 ? (
            <div className="text-gray-500">No data found.</div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {topCompleted.map(user => <UserCard key={user._id} user={user} type="completed" />)}
            </div>
          )}
        </div>
      </div>
      {/* Main Table Section */}
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
                <AdminTable columns={userColumns} data={course.users} emptyMessage="No users enrolled." tableClassName="min-w-full bg-white border rounded shadow mb-4" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserActivityReport; 