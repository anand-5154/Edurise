import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import { errorToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";
import VideoPlayer from '../../components/VideoPlayer';

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
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', courseId);
        const response = await axiosInstance.get(`/users/courses/${courseId}`);
        console.log('Course data:', response.data);
        setCourse(response.data);
      } catch (error: any) {
        console.error('Error fetching course:', error.response || error);
        errorToast(error.response?.data?.message || 'Failed to fetch course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                {console.log('Demo video URL:', course.demoVideo)}
                <VideoPlayer videoUrl={course.demoVideo} />
              </div>
            )}

            <div className="mt-8">
              <button
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails; 