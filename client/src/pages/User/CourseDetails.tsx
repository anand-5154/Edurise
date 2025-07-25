import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import { errorToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";
import VideoPlayer from '../../components/VideoPlayer';
import Navbar from '../../components/Navbar';
import { checkUserEnrolled } from '../../services/apiService';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  demoVideo: string;
  instructor: {
    name: string;
    email: string;
  };
  lectures?: { title: string; videoUrl: string; description: string }[];
}

interface CourseDetailsProps {
  mode?: 'user' | 'admin';
  fetchEndpoint?: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ mode = 'user', fetchEndpoint }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLearning, setShowLearning] = useState(false);
  const [completedLectures, setCompletedLectures] = useState<number[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const endpoint = fetchEndpoint || (mode === 'admin' ? `/admin/courses/${courseId}` : `/api/users/courses/${courseId}`);
        const response = await axiosInstance.get(endpoint);
        setCourse(response.data as Course);
      } catch (error: any) {
        errorToast(error.response?.data?.message || 'Failed to fetch course details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, mode, fetchEndpoint]);

  useEffect(() => {
    if (mode === 'admin') return; // Skip enrollment check for admin
    if (courseId) {
      checkUserEnrolled(courseId)
        .then(res => setIsEnrolled((res.data as { enrolled: boolean }).enrolled))
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            setAuthError('Please log in to enroll in this course.');
          } else {
            setIsEnrolled(false);
          }
        });
    }
  }, [courseId, mode]);

  useEffect(() => {
    if (mode === 'admin') return; // Skip progress for admin
    if (isEnrolled && courseId) {
      axiosInstance.get(`api/users/courses/${courseId}/progress`)
        .then(res => {
          const data = res.data as { completedLectures: number[] };
          setCompletedLectures(data.completedLectures || []);
        })
        .catch(() => setCompletedLectures([]));
    }
  }, [isEnrolled, courseId, mode]);

  const handleMarkCompleted = async (lectureIdx: number) => {
    if (!courseId || mode === 'admin') return;
    try {
      await axiosInstance.post(`/api/users/courses/${courseId}/lectures/${lectureIdx}/complete`);
      setCompletedLectures(prev => [...prev, lectureIdx]);
    } catch (err) {
      errorToast('Failed to mark as completed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          </div>
        </div>
        {/* Footer */}
        <footer className="relative bg-white/5 backdrop-blur-xl py-8 px-4 text-center text-sm text-gray-300 flex flex-col md:flex-row items-center justify-between gap-4 border-t-2 border-violet-700/30 mt-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-400 opacity-70" />
          <span className="text-gray-300 z-10">© {new Date().getFullYear()} <span className="font-bold text-violet-300">EduRise</span>. All rights reserved.</span>
          <span className="flex gap-4 justify-center mt-2 md:mt-0 z-10">
            <a href="#" className="hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-400/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
            <a href="#" className="hover:text-violet-400 transition-colors p-2 rounded-full hover:bg-violet-400/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
            <a href="#" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-300/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
          </span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="relative h-96">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Overview</h2>
                <p className="text-gray-600 mb-6">{course.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-900">Price:</span>
                    <span className="ml-2 text-gray-600">${course.price}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Duration:</span>
                    <span className="ml-2 text-gray-600">{course.duration} hours</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Level:</span>
                    <span className="ml-2 text-gray-600 capitalize">{course.level}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">{course.instructor.name}</p>
                  <p className="text-gray-600">{course.instructor.email}</p>
                </div>
              </div>
            </div>

            {course.demoVideo && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Preview</h2>
                <VideoPlayer videoUrl={course.demoVideo} />
              </div>
            )}

            {/* Hide user actions in admin mode */}
            {mode === 'user' && (
            <div className="mt-8">
              {authError ? (
                <div className="text-red-600 font-semibold mb-4">{authError}</div>
              ) : isEnrolled ? (
                <button
                  className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => navigate(`/courses/${course._id}/learn`)}
                >
                  Start Learning
                </button>
              ) : (
                <button
                  className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (course) {
                      if (authError) {
                        navigate('/users/login');
                        return;
                      }
                      navigate(`/courses/${course._id}/payment`, { state: { course } });
                    }
                  }}
                  disabled={isEnrolled}
                >
                  Enroll Now
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="relative bg-white/5 backdrop-blur-xl py-8 px-4 text-center text-sm text-gray-300 flex flex-col md:flex-row items-center justify-between gap-4 border-t-2 border-violet-700/30 mt-12 shadow-2xl overflow-hidden">
        {/* Decorative top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-400 opacity-70" />
        <span className="text-gray-300 z-10">© {new Date().getFullYear()} <span className="font-bold text-violet-300">EduRise</span>. All rights reserved.</span>
        <span className="flex gap-4 justify-center mt-2 md:mt-0 z-10">
          <a href="#" className="hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-400/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
          <a href="#" className="hover:text-violet-400 transition-colors p-2 rounded-full hover:bg-violet-400/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
          <a href="#" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-300/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
        </span>
      </footer>
    </div>
  );
};

export default CourseDetails; 