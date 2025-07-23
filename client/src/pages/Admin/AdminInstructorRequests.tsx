import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/apiService';
import { errorToast, successToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";
import { Check, X } from 'lucide-react';

interface InstructorRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  yearsOfExperience: string[];
  education: string[];
  createdAt: string;
}

const AdminInstructorRequests = () => {
  const [requests, setRequests] = useState<InstructorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/admin/instructors?status=pending');
      setRequests(response.data.instructors);
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to fetch instructor requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (instructorId: string) => {
    try {
      await axiosInstance.put(`/admin/instructors/${instructorId}/verify`);
      successToast('Instructor approved successfully');
      setRequests(requests.filter(request => request._id !== instructorId));
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to approve instructor');
    }
  };

  const handleReject = async (instructorId: string) => {
    try {
      await axiosInstance.put(`/admin/instructors/${instructorId}/reject`);
      successToast('Instructor rejected successfully');
      setRequests(requests.filter(request => request._id !== instructorId));
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to reject instructor');
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Instructor Requests</h1>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No pending instructor requests</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.yearsOfExperience && request.yearsOfExperience.length > 0 ? request.yearsOfExperience.join(', ') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.education && request.education.length > 0 ? request.education.join(', ') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Request"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Request"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInstructorRequests; 