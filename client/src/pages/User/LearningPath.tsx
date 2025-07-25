import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

interface LearningPath {
  _id: string;
  name: string;
  description: string;
  courses: any[];
}

const LearningPath: React.FC = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/users/learning-paths')
      .then(res => setPaths(res.data))
      .catch(() => setPaths([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (pathId: string) => {
    setSelectedPath(pathId);
    // For now, just navigate back to LearningArea with the selected path (could use state or query param)
    navigate('/learning-area', { state: { selectedPath: pathId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Learning Path</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Choose Your Path</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : paths.length === 0 ? (
            <div className="text-gray-400">No learning paths available.</div>
          ) : (
            <ul className="space-y-4">
              {paths.map(path => (
                <li key={path._id} className={`border rounded p-4 ${selectedPath === path._id ? 'border-blue-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{path.name}</div>
                      <div className="text-gray-600 text-sm mb-2">{path.description}</div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg ${selectedPath === path._id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-100'}`}
                      onClick={() => handleSelect(path._id)}
                    >
                      {selectedPath === path._id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPath; 