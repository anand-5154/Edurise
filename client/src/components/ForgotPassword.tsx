import React, { useEffect, useState } from "react";
import { successToast } from "./Toast";
import { useNavigate } from "react-router-dom";
import { forgotPasswordS } from "../services/common.service";

interface OtpPageProps {
  role: "users" | "instructors";
}

const ForgotPassword: React.FC<OtpPageProps> = ({ role }) => {
  const navigate = useNavigate();
  const usertoken = localStorage.getItem("usersToken");
  const instructortoken = localStorage.getItem("instructorsToken");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (role === "users" && usertoken) navigate("/home");
    if (role == "instructors" && instructortoken)
      navigate("/instructors/dashboard");
  }, [usertoken, instructortoken, navigate, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");

    try {
      localStorage.setItem("email", email);
      const response = await forgotPasswordS(role, email);
      if (response && response.status === 200) {
        successToast((response.data as { message: string }).message);
        navigate(`/${role}/reset-verify-otp`);
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your email to receive an OTP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onKeyDown={(e) => {
                if (e.repeat) e.preventDefault();
              }}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              placeholder="you@example.com"
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
