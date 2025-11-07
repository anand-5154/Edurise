import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { errorToast, successToast } from "./Toast";
import { forgotVerifyOtpS, resendOtpS } from "../services/common.service";
import type { AxiosError } from "axios";

interface OtpPageProps {
  role: "users" | "instructors";
}

const ForgotOtpPage: React.FC<OtpPageProps> = ({ role }) => {
  const [otp, setOtp] = useState("");
  const usertoken = localStorage.getItem("usersToken");
  const instructortoken = localStorage.getItem("instructorsToken");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (role == "users" && usertoken) navigate("/");
    if (role == "instructors" && instructortoken)
      navigate("/instructors/dashboard");
  }, [usertoken, instructortoken, navigate, role]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const validateField=()=>{
    if(otp.length<6||otp.length>6){
      errorToast("Invalid OTP")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if(!validateField) return
    setError("");

    try {
      const stored = localStorage.getItem("email");
      const email = stored || null;

      if (!email) return;

      const response = await forgotVerifyOtpS(role, email, otp);

      if (response && response.status === 200) {
        successToast((response.data as { message: string }).message);
        navigate(`/${role}/resetpassword`);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      errorToast(error.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    if(!validateField) return
    setCanResend(false);
    setTimer(60);

    try {
      const stored = localStorage.getItem("email");
      const email = stored || null;
      if (!email) {
        setError("Email not found for resending OTP");
        return;
      }

      await resendOtpS(role, email);
      successToast("OTP resent successfully!");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      errorToast(error.response?.data?.message ?? "Something went wrong");
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Verify Your Account
        </h2>

        <p className="text-gray-600 text-sm text-center mb-6">
          Enter the 6-digit OTP sent to your email
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <p>
              Resend OTP in {timer} second{timer !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotOtpPage;
