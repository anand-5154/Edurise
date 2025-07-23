import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import BeatLoader from 'react-spinners/BeatLoader';

interface EnrolledUser {
  _id: string;
  name: string;
  email: string;
}

interface Lecture {
  _id: string;
  title: string;
}

interface Module {
  _id: string;
  title: string;
  lectures: Lecture[];
}

interface ProgressByUser {
  [userId: string]: {
    completedLectures: string[];
    completedModules: string[];
  };
}

const Progress: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [progressByUser, setProgressByUser] = useState<ProgressByUser>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axiosInstance.get(`/instructors/courses/${courseId}/progress`);
        setEnrolledUsers(res.data.enrolledUsers || []);
        setModules(res.data.modules || []);
        setProgressByUser(res.data.progressByUser || {});
      } catch (err) {
        setEnrolledUsers([]);
        setModules([]);
        setProgressByUser({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  if (!modules.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Course not found or has no modules</h2>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </div>
    );
  }

  // Helper: check if all lectures in a module are completed for a user
  const isModuleCompleted = (userId: string, module: Module) =>
    module.lectures.every(lec => progressByUser[userId]?.completedLectures.includes(lec._id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Progress</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b" rowSpan={2}>Student</th>
                <th className="px-4 py-2 border-b" rowSpan={2}>Email</th>
                {modules.map((mod) => (
                  <th key={mod._id} className="px-4 py-2 border-b text-center" colSpan={mod.lectures.length + 1}>
                    {mod.title}
                  </th>
                ))}
              </tr>
              <tr>
                {modules.map((mod) => (
                  <React.Fragment key={mod._id}>
                    {mod.lectures.map(lec => (
                      <th key={lec._id} className="px-2 py-1 border-b text-xs">{lec.title}</th>
                    ))}
                    <th className="px-2 py-1 border-b text-xs">Module ✔️</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrolledUsers.length === 0 ? (
                <tr>
                  <td colSpan={2 + modules.reduce((sum, m) => sum + m.lectures.length + 1, 0)} className="text-center py-8 text-gray-500">No students enrolled yet.</td>
                </tr>
              ) : (
                enrolledUsers.map(user => (
                  <tr key={user._id}>
                    <td className="px-4 py-2 border-b font-medium">{user.name}</td>
                    <td className="px-4 py-2 border-b">{user.email}</td>
                    {modules.map(mod => (
                      <React.Fragment key={mod._id}>
                        {mod.lectures.map(lec => (
                          <td key={lec._id} className="px-2 py-1 border-b text-center">
                            {progressByUser[user._id]?.completedLectures.includes(lec._id) ? <span className="text-green-600 font-bold">✔️</span> : ''}
                          </td>
                        ))}
                        <td className="px-2 py-1 border-b text-center">
                          {progressByUser[user._id]?.completedModules.includes(mod._id) ? <span className="text-green-600 font-bold">✔️</span> : ''}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-gray-200 rounded">Back</button>
      </div>
    </div>
  );
};

export default Progress; 