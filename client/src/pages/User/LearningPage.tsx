import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import BeatLoader from 'react-spinners/BeatLoader';
import VideoPlayer from '../../components/VideoPlayer';
import Navbar from '../../components/Navbar';
import { errorToast } from '../../components/Toast';

interface Course {
  _id: string;
  title: string;
  lectures?: { title: string; videoUrl: string }[];
  thumbnail: string;
}

const LearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLectures, setCompletedLectures] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          axiosInstance.get(`/users/courses/${courseId}`),
          axiosInstance.get(`/users/courses/${courseId}/progress`)
        ]);
        setCourse(courseRes.data);
        setCompletedLectures(progressRes.data.completedLectures || []);
      } catch (err) {
        errorToast('Failed to load course or progress');
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndProgress();
  }, [courseId]);

  const handleMarkCompleted = async (lectureIdx: number) => {
    if (!courseId) return;
    try {
      await axiosInstance.post(`/users/courses/${courseId}/lectures/${lectureIdx}/complete`);
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
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="relative h-64">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <h2 className="text-2xl font-bold mb-4">Course Lectures</h2>
            {course.lectures && course.lectures.length > 0 ? (
              <div className="space-y-8">
                {course.lectures.map((lecture, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:space-x-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        {lecture.title}
                        {completedLectures.includes(idx) && (
                          <span className="ml-2 text-green-600 text-base font-bold">✔️</span>
                        )}
                      </h3>
                      <VideoPlayer videoUrl={lecture.videoUrl} title={lecture.title} />
                    </div>
                    <div className="mt-4 md:mt-0 md:w-48 flex-shrink-0 flex flex-col items-end">
                      {completedLectures.includes(idx) ? (
                        <span className="text-green-600 font-medium">Completed</span>
                      ) : (
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          onClick={() => handleMarkCompleted(idx)}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No lectures available for this course yet.</p>
            )}
            <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Back to Course Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage; 