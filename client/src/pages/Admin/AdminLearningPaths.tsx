import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';

interface Course {
  _id: string;
  title: string;
}

interface LearningPath {
  _id: string;
  name: string;
  description: string;
  courses: Course[];
}

const AdminLearningPaths: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchLearningPaths();
  }, []);

  const fetchCourses = () => {
    axiosInstance.get('/admin/courses')
      .then(res => setCourses(res.data.courses || res.data))
      .catch(() => setCourses([]));
  };

  const fetchLearningPaths = () => {
    axiosInstance.get('/admin/learning-paths')
      .then(res => setLearningPaths(res.data))
      .catch(() => setLearningPaths([]))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      if (editingId) {
        await axiosInstance.put(`/admin/learning-paths/${editingId}`, {
          name,
          description,
          courses: selectedCourses
        });
        setSuccess('Learning path updated successfully!');
      } else {
        await axiosInstance.post('/admin/learning-paths', {
          name,
          description,
          courses: selectedCourses
        });
        setSuccess('Learning path created successfully!');
      }
      setName('');
      setDescription('');
      setSelectedCourses([]);
      setEditingId(null);
      fetchLearningPaths();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save learning path');
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleEdit = (path: LearningPath) => {
    setEditingId(path._id);
    setName(path.name);
    setDescription(path.description);
    setSelectedCourses(path.courses.map(c => c._id));
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this learning path?')) return;
    try {
      await axiosInstance.delete(`/admin/learning-paths/${id}`);
      setSuccess('Learning path deleted successfully!');
      fetchLearningPaths();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete learning path');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedCourses([]);
    setSuccess('');
    setError('');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Learning Paths</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto mb-8">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Courses</label>
          {loading ? (
            <div className="text-gray-400">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-400">No courses available.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {courses.map(course => (
                <label key={course._id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => handleCourseToggle(course._id)}
                  />
                  {course.title}
                </label>
              ))}
            </div>
          )}
        </div>
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            disabled={loading}
          >
            {editingId ? 'Update Path' : 'Create Path'}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-semibold"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Existing Learning Paths</h2>
        {loading ? (
          <div className="text-gray-400">Loading learning paths...</div>
        ) : learningPaths.length === 0 ? (
          <div className="text-gray-400">No learning paths found.</div>
        ) : (
          <ul className="space-y-4">
            {learningPaths.map(path => (
              <li key={path._id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-semibold text-lg">{path.name}</div>
                  <div className="text-gray-600 text-sm mb-1">{path.description}</div>
                  <div className="text-gray-500 text-xs">Courses: {path.courses.map(c => c.title).join(', ')}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-semibold"
                    onClick={() => handleEdit(path)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                    onClick={() => handleDelete(path._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminLearningPaths; 