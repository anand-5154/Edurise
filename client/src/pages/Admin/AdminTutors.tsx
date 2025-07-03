import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';
import { errorToast, successToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";
import { Search, Lock, LockOpen } from 'lucide-react';

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  accountStatus: string;
  blocked: boolean;
  createdAt: string;
}

interface TutorsResponse {
  instructors: Tutor[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10;

const AdminTutors = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutors();
  }, [currentPage, searchTerm]);

  const fetchTutors = async () => {
    try {
      const response = await axiosInstance.get<TutorsResponse>(`/admin/instructors?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}`);
      setTutors(response.data.instructors);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTutor = async (tutorId: string) => {
    try {
      await axiosInstance.post(`/admin/instructors/${tutorId}/block`);
      successToast('Tutor blocked successfully');
      fetchTutors();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to block tutor');
    }
  };

  const handleUnblockTutor = async (tutorId: string) => {
    try {
      await axiosInstance.post(`/admin/instructors/${tutorId}/unblock`);
      successToast('Tutor unblocked successfully');
      fetchTutors();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to unblock tutor');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tutors</h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tutors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Tutors Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tutors.map((tutor) => (
                <tr key={tutor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tutor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tutor.blocked 
                        ? 'bg-red-100 text-red-800'
                        : tutor.accountStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : tutor.accountStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tutor.blocked ? 'Blocked' : tutor.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tutor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => tutor.blocked ? handleUnblockTutor(tutor._id) : handleBlockTutor(tutor._id)}
                      className={`transition-colors ${
                        tutor.blocked 
                          ? 'text-red-600 hover:text-red-800'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                      title={tutor.blocked ? 'Unblock Tutor' : 'Block Tutor'}
                    >
                      {tutor.blocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <LockOpen className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTutors;
