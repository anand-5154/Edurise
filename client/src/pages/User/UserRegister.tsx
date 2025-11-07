import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import image from "../../assets/learnAt-removebg-preview.png";
import { errorToast, successToast } from "../../components/Toast";
import { FcGoogle } from "react-icons/fc";
import { userRegisterS } from "../../services/user.services";
import { USER_ROUTES } from "../../constants/routes.constants";
import type { AxiosError } from "axios";

interface FormData { name: string; username: string; email: string; password: string; confirmPassword: string; phone: string; }

const UserRegister: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const usertoken = localStorage.getItem("usersToken");
  const [formData, setFormData] = useState<FormData>({ name: "", username: "", email: "", password: "", confirmPassword: "", phone: "" });
  const navigate = useNavigate();
  const [canSubmit, setCanSubmit] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => { if (usertoken) navigate("/home"); }, [usertoken, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) newErrors.name = "Name should contain only letters and spaces";
    if (formData.name.length > 20) newErrors.name = "Name cannot exceed 20 characters";
    if (formData.username.length < 4) newErrors.username = "Username must be at least 4 characters";
    if (formData.username.length > 10) newErrors.username = "Username must not exceed 10 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    const phoneRegex = /^\d{10}$/; if (formData.phone && !phoneRegex.test(formData.phone)) newErrors.phone = "Invalid phone number format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const filled = formData.name.trim() && formData.username.trim() && formData.email.trim() && formData.password.trim() && formData.confirmPassword.trim() && formData.phone.trim();
    setCanSubmit(Boolean(filled));
  }, [formData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await userRegisterS(formData);
      setIsLoading(false);
      if (response && response.status === 200) {
        successToast((response.data as { message: string }).message);
        localStorage.setItem("signUpData", JSON.stringify(formData));
        navigate(USER_ROUTES.VERIFY_OTP);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      errorToast(error.response?.data?.message ?? "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] grid place-items-center p-6">
      <div className="max-w-5xl w-full grid lg:grid-cols-5 gap-8">
        <div className="card p-8 text-center lg:col-span-2">
          <div className="w-40 mx-auto">
            <img src={image} alt="register logo" className="w-full" />
          </div>
          <h3 className="h3 mt-4">Join Us Today</h3>
          <p className="text-[color:var(--text-600)]">Create your account and become part of our community.</p>
        </div>

        <div className="card p-8 lg:col-span-3">
          <div className="text-center mb-4">
            <h2 className="h3">Create Account</h2>
            <p className="text-[color:var(--text-600)]">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Full Name</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Username</label>
                <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="johndoe123" />
                {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Email Address</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Phone Number</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Password</label>
                <input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button type="submit" disabled={!canSubmit || isLoading} className="btn btn-primary w-full">
                {isLoading ? "Registering..." : "Create Account"}
              </button>

              <a href={import.meta.env.VITE_GOOGLE_AUTH_URL} className="btn btn-ghost w-full inline-flex items-center justify-center gap-2">
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </a>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--text-600)]">
            Already have an account? <Link to={USER_ROUTES.LOGIN} className="text-[color:var(--primary-600)]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
