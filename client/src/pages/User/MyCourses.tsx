import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const MyCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (axiosInstance.get('/api/users/my-courses') as Promise<any>)
      .then(res => {
        setCourses(res.data as any[]);
        console.log('Fetched courses:', res.data);
      })
      .catch((err) => {
        setCourses([]);
        setError('Failed to load courses');
        console.error('Error fetching courses:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><span>Loading...</span></div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen pt-20 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto flex-1 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Purchased Courses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-12 text-lg">You have not purchased any courses yet.</div>
          ) : (
            courses.map((course: any) => (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-48">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-600">${course.price}</span>
                    <span className="text-sm text-gray-500">{course.duration}h</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    By {course.instructor?.name || 'Unknown'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyCourses; 