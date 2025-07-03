import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import BeatLoader from 'react-spinners/BeatLoader';

interface StudentProgress {
  _id: string;
  name: string;
  email: string;
  completedLectures: number[];
}

interface Course {
  title: string;
  lectures?: { title: string; videoUrl: string }[];
}

const Progress: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [progressRes, courseRes] = await Promise.all([
          axiosInstance.get(`/instructors/courses/${courseId}/progress`),
          axiosInstance.get(`/instructors/courses/${courseId}`)
        ]);
        setStudents(progressRes.data.students || []);
        setCourse(courseRes.data);
      } catch (err) {
        setStudents([]);
        setCourse(null);
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Progress for: {course.title}</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Student</th>
                <th className="px-4 py-2 border-b">Email</th>
                {course.lectures && course.lectures.map((lec, idx) => (
                  <th key={idx} className="px-4 py-2 border-b">{lec.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={2 + (course.lectures?.length || 0)} className="text-center py-8 text-gray-500">No students enrolled yet.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student._id}>
                    <td className="px-4 py-2 border-b font-medium">{student.name}</td>
                    <td className="px-4 py-2 border-b">{student.email}</td>
                    {course.lectures && course.lectures.map((_, idx) => (
                      <td key={idx} className="px-4 py-2 border-b text-center">
                        {student.completedLectures.includes(idx) ? <span className="text-green-600 font-bold">✔️</span> : ''}
                      </td>
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