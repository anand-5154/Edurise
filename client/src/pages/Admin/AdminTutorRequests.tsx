import { useState, useEffect } from "react";
import axiosInstance from "../../services/apiService";
import BeatLoader from "react-spinners/BeatLoader";

interface Tutor {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  title: string;
  yearsOfExperience: number;
  role: "user" | "admin" | "instructor";
  education: string;
  accountStatus: "pending" | "blocked" | "active";
  isVerified: boolean;
  _id: string;
}

const AdminTutorRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Tutor[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get<Tutor[]>("/admin/instructors");
        const unverifiedTutors = res.data.filter(tutor => !tutor.isVerified);
        setRequests(unverifiedTutors);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (instructorId: string) => {
    try {
      await axiosInstance.put(`/admin/instructors/${instructorId}/verify`);
      setRequests(prev => prev.filter(t => t._id !== instructorId));
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (instructorId: string) => {
    try {
      await axiosInstance.put(`/admin/instructors/${instructorId}/reject`);
      setRequests(prev => prev.filter(t => t._id !== instructorId));
    } catch (err) {
      console.log(err);
    }
  };

  const toggleDetails = (email: string) => {
    setExpandedEmail(prev => (prev === email ? null : email));
  };

  return loading ? (
    <div className="flex justify-center items-center h-180">
      <BeatLoader color="#2563eb" size={30} />
    </div>
  ) : (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tutor Verification Requests</h2>

        {requests.length === 0 ? (
          <p className="text-gray-500">No pending tutor requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map(tutor => (
              <div key={tutor.email} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{tutor.name}</h3>
                    <p className="text-sm text-gray-600">Email: {tutor.email}</p>
                    <p className="text-sm text-gray-600">Title: {tutor.title}</p>
                  </div>
                  <button
                    onClick={() => toggleDetails(tutor.email)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {expandedEmail === tutor.email ? "Hide" : "View"}
                  </button>
                </div>

                {/* Expanded details */}
                {expandedEmail === tutor.email && (
                  <div className="mt-4 border-t pt-4 space-y-1 text-sm text-gray-600">
                    <p><strong>Username:</strong> {tutor.username}</p>
                    <p><strong>Phone:</strong> {tutor.phone}</p>
                    <p><strong>Experience:</strong> {tutor.yearsOfExperience} years</p>
                    <p><strong>Education:</strong> {tutor.education}</p>
                    <p><strong>Account Status:</strong> {tutor.accountStatus}</p>
                    <p><strong>Role:</strong> {tutor.role}</p>

                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleAccept(tutor._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(tutor._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTutorRequests;
