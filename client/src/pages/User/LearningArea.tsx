import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/apiService';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
}

const LearningArea: React.FC = () => {
  const location = useLocation();
  const selectedPath = (location.state as any)?.selectedPath || null;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPath) {
      setLoading(true);
      axiosInstance.get(`/api/users/learning-paths/${selectedPath}/courses`)
        .then(res => setCourses(res.data))
        .catch(() => setCourses([]))
        .finally(() => setLoading(false));
    } else {
      setCourses([]);
    }
  }, [selectedPath]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Learning Area</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Learning Path</h2>
          <p className="mb-4 text-gray-700">Follow a curated learning path to achieve your goals faster.</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => window.location.href = '/learning-area/path'}
          >
            View Learning Path
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Courses Based on Your Path</h2>
          {selectedPath ? (
            loading ? (
              <div className="text-gray-400">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="text-gray-400">No courses found for this path.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course._id} className="bg-gray-100 rounded-lg p-4 shadow">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover rounded mb-2" />
                    <div className="font-semibold text-lg mb-1">{course.title}</div>
                    <div className="text-gray-600 text-sm mb-2">{course.description}</div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => window.location.href = `/courses/${course._id}`}>View Course</button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-gray-400">No learning path selected yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningArea; 