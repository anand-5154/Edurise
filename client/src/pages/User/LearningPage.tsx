import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import BeatLoader from 'react-spinners/BeatLoader';
import VideoPlayer from '../../components/VideoPlayer';
import Navbar from '../../components/Navbar';
import { errorToast } from '../../components/Toast';

interface Module {
  _id: string;
  title: string;
  description?: string;
}

interface Lecture {
  _id: string;
  title: string;
  videoUrl: string;
  order: number;
  description?: string;
}

interface CourseInfo {
  _id: string;
  title: string;
  description?: string;
}

const LearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [unlocked, setUnlocked] = useState<boolean[]>([]);
  const [completedModules, setCompletedModules] = useState<boolean[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [completedLectures, setCompletedLectures] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return;
      try {
        const res = await axiosInstance.get<CourseInfo>(`/api/users/courses/${courseId}`);
        setCourseInfo(res.data);
      } catch (err) {
        setCourseInfo(null);
      }
    };
    fetchCourseInfo();
  }, [courseId]);

  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get<{ modules: Module[]; unlocked: boolean[]; completed: boolean[] }>(`/api/users/courses/${courseId}/modules`);
        setModules(res.data.modules);
        setUnlocked(res.data.unlocked);
        setCompletedModules(res.data.completed);
        setSelectedModule(null);
        setLectures([]);
        setCompletedLectures([]);
      } catch (err) {
        errorToast('Failed to load modules');
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchModules();
  }, [courseId]);

  const handleModuleClick = async (module: Module, idx: number) => {
    if (!unlocked[idx]) return;
    setSelectedModule(module);
    setIsLoading(true);
    try {
      const res = await axiosInstance.get<{ lectures: Lecture[]; completed: boolean[] }>(`/api/users/modules/${module._id}/lectures`);
      setLectures(res.data.lectures);
      setCompletedLectures(res.data.completed);
    } catch (err) {
      errorToast('Failed to load lectures');
      setLectures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async (lectureIdx: number) => {
    if (!selectedModule || !lectures[lectureIdx]) return;
    try {
      await axiosInstance.post(`/api/users/modules/${selectedModule._id}/lectures/${lectures[lectureIdx]._id}/complete`);
      setCompletedLectures(prev => {
        const updated = [...prev];
        updated[lectureIdx] = true;
        return updated;
      });
      // Optionally, refetch modules to update unlock/completion status
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{courseInfo?.title || 'Course Modules'}</h1>
            {courseInfo?.description && (
              <p className="text-gray-600 mb-6 text-lg">{courseInfo.description}</p>
            )}
            <div className="space-y-4">
              {modules.length === 0 && <p className="text-gray-600">No modules available for this course yet.</p>}
              {modules.map((module, idx) => (
                <div key={module._id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                  <button
                    className={`text-lg font-semibold ${unlocked[idx] ? 'text-blue-700' : 'text-gray-400 cursor-not-allowed'}`}
                    onClick={() => handleModuleClick(module, idx)}
                    disabled={!unlocked[idx]}
                  >
                    {module.title}
                  </button>
                  {completedModules[idx] && <span className="text-green-600 font-bold">✔️ Completed</span>}
                  {!unlocked[idx] && <span className="text-gray-400">🔒 Locked</span>}
                </div>
              ))}
            </div>

            {selectedModule && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-2">Lectures in {selectedModule.title}</h2>
                {selectedModule.description && (
                  <p className="text-gray-600 mb-4 text-base">{selectedModule.description}</p>
                )}
                {lectures.length === 0 && <p className="text-gray-600">No lectures available for this module yet.</p>}
                <div className="space-y-8">
                  {lectures.map((lecture, idx) => (
                    <div key={lecture._id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:space-x-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          {lecture.title}
                          {completedLectures[idx] && (
                            <span className="ml-2 text-green-600 text-base font-bold">✔️</span>
                          )}
                        </h3>
                        <VideoPlayer videoUrl={lecture.videoUrl} title={lecture.title} />
                        {lecture.description && (
                          <p className="mt-2 text-gray-600 text-base">{lecture.description}</p>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0 md:w-48 flex-shrink-0 flex flex-col items-end">
                        {completedLectures[idx] ? (
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
              </div>
            )}
            <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Back to Course Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage; 