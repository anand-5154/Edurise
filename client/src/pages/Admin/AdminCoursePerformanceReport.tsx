import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';
import AdminTable, { type Column } from '../../components/AdminTable';

interface CoursePerformance {
  title: string;
  enrollments: number;
  completions: number;
}

interface TopCourse {
  _id: string;
  title: string;
  enrollmentsCount?: number;
  completionsCount?: number;
}

const columns: Column<CoursePerformance>[] = [
  { label: 'Course', accessor: 'title', className: 'px-4 py-2 border-b font-medium' },
  { label: 'Enrollments', accessor: 'enrollments', className: 'px-4 py-2 border-b' },
  { label: 'Completions', accessor: 'completions', className: 'px-4 py-2 border-b' },
];

const CourseCard = ({ course, type }: { course: TopCourse; type: 'enrolled' | 'completed' }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 mb-2">
      {course.title?.[0]?.toUpperCase() || '?'}
    </div>
    <div className="font-semibold text-gray-800 text-lg text-center">{course.title}</div>
    <div className="mt-2 text-blue-700 font-bold text-xl">
      {type === 'enrolled' && <>{course.enrollmentsCount} <span className="text-xs font-normal text-gray-500">enrollments</span></>}
      {type === 'completed' && <>{course.completionsCount} <span className="text-xs font-normal text-gray-500">completions</span></>}
    </div>
  </div>
);

const AdminCoursePerformanceReport: React.FC = () => {
  const [data, setData] = useState<CoursePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [topEnrolled, setTopEnrolled] = useState<TopCourse[]>([]);
  const [topCompleted, setTopCompleted] = useState<TopCourse[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/admin/reports/course-performance')
      .then(res => setData(res.data as CoursePerformance[]))
      .catch(() => setData([]))
      .then(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTrendsLoading(true);
    axiosInstance.get('/admin/reports/course-trends')
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
      <h1 className="text-2xl font-bold mb-6">Course Performance Report</h1>
      {/* Top Courses Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Top Enrolled Courses</h2>
          {trendsLoading ? (
            <div>Loading...</div>
          ) : topEnrolled.length === 0 ? (
            <div className="text-gray-500">No data found.</div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {topEnrolled.map(course => <CourseCard key={course._id} course={course} type="enrolled" />)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-700">Top Completed Courses</h2>
          {trendsLoading ? (
            <div>Loading...</div>
          ) : topCompleted.length === 0 ? (
            <div className="text-gray-500">No data found.</div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {topCompleted.map(course => <CourseCard key={course._id} course={course} type="completed" />)}
            </div>
          )}
        </div>
      </div>
      {/* Main Table Section */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <AdminTable columns={columns} data={data} emptyMessage="No course performance data found." />
        </div>
      )}
    </div>
  );
};

export default AdminCoursePerformanceReport; 