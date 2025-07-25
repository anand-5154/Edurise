import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';
import { errorToast, successToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";
import { Search, Lock, LockOpen } from 'lucide-react';
import { Dialog } from '@headlessui/react';

interface Instructor {
  _id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  title?: string;
  yearsOfExperience?: string[];
  education?: string[];
  isVerified: boolean;
  accountStatus: string;
  blocked: boolean;
  profilePicture?: string;
  createdAt: string;
  documentUrl?: string; // Add documentUrl
}

const ITEMS_PER_PAGE = 10;

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, [currentPage, searchTerm]);

  const fetchInstructors = async () => {
    try {
      const response = await axiosInstance.get(`/admin/instructors?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}`);
      setInstructors(response.data.instructors);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockInstructor = async (instructorId: string) => {
    try {
      await axiosInstance.post(`/admin/instructors/${instructorId}/block`);
      successToast('Instructor blocked successfully');
      fetchInstructors();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to block instructor');
    }
  };

  const handleUnblockInstructor = async (instructorId: string) => {
    try {
      await axiosInstance.post(`/admin/instructors/${instructorId}/unblock`);
      successToast('Instructor unblocked successfully');
      fetchInstructors();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to unblock instructor');
    }
  };

  const handleApproveInstructor = async (instructorId: string) => {
    try {
      await axiosInstance.put(`/admin/instructors/${instructorId}/verify`);
      successToast('Instructor approved successfully');
      fetchInstructors();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to approve instructor');
    }
  };

  const handleRejectInstructor = async (instructorId: string) => {
    try {
      await axiosInstance.put(`/admin/instructors/${instructorId}/reject`);
      successToast('Instructor rejected successfully');
      fetchInstructors();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to reject instructor');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setShowModal(true);
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
          <h1 className="text-2xl font-bold text-gray-800">Instructors</h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search instructors..."
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

        {/* Instructors Table */}
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
              {instructors.map((instructor) => (
                <tr key={instructor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{instructor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      instructor.blocked 
                        ? 'bg-red-100 text-red-800'
                        : instructor.accountStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : instructor.accountStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : instructor.accountStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {instructor.blocked ? 'Blocked' : instructor.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(instructor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {instructor.accountStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveInstructor(instructor._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Instructor"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectInstructor(instructor._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Instructor"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewDetails(instructor)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => instructor.blocked ? handleUnblockInstructor(instructor._id) : handleBlockInstructor(instructor._id)}
                      className={`transition-colors ${
                        instructor.blocked 
                          ? 'text-red-600 hover:text-red-800'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                      title={instructor.blocked ? 'Unblock Instructor' : 'Block Instructor'}
                    >
                      {instructor.blocked ? (
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

      {/* Modal for instructor details */}
      {showModal && selectedInstructor && (
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Panel className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto p-6 z-20">
              <Dialog.Title className="text-xl font-bold mb-4">Instructor Details</Dialog.Title>
              <div className="space-y-2">
                {selectedInstructor.profilePicture && (
                  <img src={selectedInstructor.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                )}
                <div><strong>Name:</strong> {selectedInstructor.name}</div>
                {selectedInstructor.username && <div><strong>Username:</strong> {selectedInstructor.username}</div>}
                <div><strong>Email:</strong> {selectedInstructor.email}</div>
                <div><strong>Phone:</strong> {selectedInstructor.phone}</div>
                {selectedInstructor.title && <div><strong>Title:</strong> {selectedInstructor.title}</div>}
                {selectedInstructor.yearsOfExperience && selectedInstructor.yearsOfExperience.length > 0 && (
                  <div><strong>Years of Experience:</strong>
                    <ul className="list-disc ml-5">
                      {selectedInstructor.yearsOfExperience.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedInstructor.education && selectedInstructor.education.length > 0 && (
                  <div><strong>Education:</strong>
                    <ul className="list-disc ml-5">
                      {selectedInstructor.education.map((edu, idx) => (
                        <li key={idx}>{edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedInstructor.documentUrl && (
                  <div>
                    <strong>Uploaded Document:</strong> <a href={selectedInstructor.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Document</a>
                  </div>
                )}
                <div><strong>Status:</strong> {selectedInstructor.accountStatus}</div>
                <div><strong>Verified:</strong> {selectedInstructor.isVerified ? 'Yes' : 'No'}</div>
                <div><strong>Blocked:</strong> {selectedInstructor.blocked ? 'Yes' : 'No'}</div>
                <div><strong>Joined:</strong> {new Date(selectedInstructor.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AdminInstructors; 