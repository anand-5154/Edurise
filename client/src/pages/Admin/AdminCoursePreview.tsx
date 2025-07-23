import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';

interface Lecture {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  resources?: string[];
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lectures: Lecture[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  modules: Module[];
  totalDuration: number;
  totalLectures: number;
  rating: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

const AdminCoursePreview: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axiosInstance.get(`/admin/courses/${courseId}`);
      setCourse(response.data);
      if (response.data.modules.length > 0) {
        setSelectedModule(response.data.modules[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading course details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/admin/courses')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 mb-4">Course not found</div>
        <button
          onClick={() => navigate('/admin/courses')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const currentModule = course.modules.find(m => m._id === selectedModule);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Preview</h1>
        <button
          onClick={() => navigate('/admin/courses')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>

      {/* Course Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover rounded"
            />
          </div>
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Price</div>
                <div className="font-semibold">${course.price}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-semibold">{formatDuration(course.totalDuration)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Lectures</div>
                <div className="font-semibold">{course.totalLectures}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Enrollments</div>
                <div className="font-semibold">{course.enrollmentCount}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">Instructor</div>
              <div className="font-semibold">{course.instructor.name}</div>
              <div className="text-sm text-gray-500">{course.instructor.email}</div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Created: {formatDate(course.createdAt)} | Last Updated: {formatDate(course.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modules List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Modules</h3>
          <div className="space-y-2">
            {course.modules.map((module, index) => (
              <button
                key={module._id}
                onClick={() => setSelectedModule(module._id)}
                className={`w-full text-left p-3 rounded ${
                  selectedModule === module._id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">
                  Module {index + 1}: {module.title}
                </div>
                <div className="text-sm text-gray-500">
                  {module.lectures.length} lectures
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lectures List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Lectures</h3>
          {currentModule ? (
            <div className="space-y-2">
              {currentModule.lectures.map((lecture, index) => (
                <button
                  key={lecture._id}
                  onClick={() => setSelectedLecture(lecture)}
                  className={`w-full text-left p-3 rounded ${
                    selectedLecture?._id === lecture._id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">
                    Lecture {index + 1}: {lecture.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {formatDuration(lecture.duration)}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Select a module to view lectures</div>
          )}
        </div>

        {/* Lecture Details */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Lecture Details</h3>
          {selectedLecture ? (
            <div>
              <h4 className="text-lg font-medium mb-2">{selectedLecture.title}</h4>
              <p className="text-gray-600 mb-4">{selectedLecture.description}</p>
              {selectedLecture.videoUrl && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Video URL:</div>
                  <a
                    href={selectedLecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedLecture.videoUrl}
                  </a>
                </div>
              )}
              {selectedLecture.resources && selectedLecture.resources.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Resources:</div>
                  <ul className="list-disc list-inside">
                    {selectedLecture.resources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          Resource {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Select a lecture to view details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoursePreview; 