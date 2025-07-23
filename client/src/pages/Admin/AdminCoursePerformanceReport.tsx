import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';

interface Lecture {
  _id: string;
  title: string;
}
interface Module {
  _id: string;
  title: string;
  lectures: Lecture[];
}
interface Course {
  _id: string;
  title: string;
  modules: Module[];
  enrollments: number;
}
interface StudentProgress {
  completedLectures: string[]; // lecture IDs
}
interface CourseAnalytics {
  course: Course;
  students: StudentProgress[];
}

const AdminCoursePerformanceReport: React.FC = () => {
  const [data, setData] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/reports/course-performance-modular')
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Course Performance Report (Modular)</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Course</th>
                <th className="px-4 py-2 border-b">Enrollments</th>
                {/* For each course, show module columns dynamically */}
                {data.length > 0 && data[0].course.modules.map((mod) => (
                  <th key={mod._id} className="px-4 py-2 border-b">{mod.title} Completion</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(({ course, students }) => (
                <tr key={course._id}>
                  <td className="px-4 py-2 border-b font-medium">{course.title}</td>
                  <td className="px-4 py-2 border-b">{course.enrollments}</td>
                  {course.modules.map(mod => {
                    const completedCount = students.filter(student =>
                      mod.lectures.every(lec => student.completedLectures.includes(lec._id))
                    ).length;
                    const percent = course.enrollments > 0 ? Math.round((completedCount / course.enrollments) * 100) : 0;
                    return (
                      <td key={mod._id} className="px-4 py-2 border-b text-center">
                        {completedCount} / {course.enrollments} ({percent}%)
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCoursePerformanceReport; 