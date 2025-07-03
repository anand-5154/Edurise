import React, { useState } from "react";
import axiosInstance from "../services/apiService";
import { successToast, errorToast } from "./Toast";
import { useNavigate } from "react-router-dom";

interface OtpPageProps {
  role: "users" | "instructors",
}

const ResetPassword: React.FC<OtpPageProps> = ({role}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        throw new Error("Email not found. Please try the forgot password process again.");
      }
      
      const response = await axiosInstance.put(`/${role}/resetpassword`, {
        email,
        newPassword,
        confirmPassword
      });
      
      if (response && response.status === 200) {
        successToast((response.data as { message: string }).message);
        localStorage.removeItem("email");
        navigate(`/${role}/login`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong. Please try again later.';
      setError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
