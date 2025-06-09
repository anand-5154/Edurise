import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import axiosInstance from '../../services/apiService';
import { errorToast, successToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  status: string;
}

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/instructors/courses');
      setCourses(response.data);
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    setIsDeleting(courseId);
    try {
      await axiosInstance.delete(`/instructors/courses/${courseId}`);
      setCourses(courses.filter(course => course._id !== courseId));
      successToast('Course deleted successfully');
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setIsDeleting(courseId);
    }
  };

  const handleEdit = (courseId: string) => {
    navigate(`/instructors/courses/edit/${courseId}`);
  };

  const handleView = (courseId: string) => {
    navigate(`/instructors/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <button
            onClick={() => navigate('/instructors/courses/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/instructors/courses/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Course
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="relative h-48">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        ${course.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {course.duration}h
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(course._id)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="View Course"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(course._id)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Edit Course"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        disabled={isDeleting === course._id}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                        title="Delete Course"
                      >
                        {isDeleting === course._id ? (
                          <BeatLoader color="#ef4444" size={8} />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses; 