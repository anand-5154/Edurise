import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {useNavigate,Link} from "react-router-dom"
import axiosInstance from '../../services/apiService';
import { successToast, errorToast } from '../../components/Toast';

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

interface TouchedFields {
  name: boolean;
  username: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  phone: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false
  });

  const navigate = useNavigate()

  // Validate name
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Name is required';
    }
    return undefined;
  };

  // Validate username
  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.length < 4) {
      return 'Username must be at least 4 characters';
    }
    return undefined;
  };

  // Validate email
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return undefined;
  };

  // Validate password
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  // Validate confirm password
  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  // Validate phone
  const validatePhone = (phone: string): string | undefined => {
    if (phone && !/^\+?[\d\s-]{10,15}$/.test(phone)) {
      return 'Invalid phone number format';
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};
    
    if (touched.name) newErrors.name = validateName(formData.name);
    if (touched.username) newErrors.username = validateUsername(formData.username);
    if (touched.email) newErrors.email = validateEmail(formData.email);
    if (touched.password) newErrors.password = validatePassword(formData.password);
    if (touched.confirmPassword) newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (touched.phone) newErrors.phone = validatePhone(formData.phone);

    setErrors(newErrors);
  }, [formData, touched]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate all fields
    newErrors.name = validateName(formData.name);
    newErrors.username = validateUsername(formData.username);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    newErrors.phone = validatePhone(formData.phone);
    
    // Update errors state
    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined);
    
    // Debug log
    console.log('Validation result:', {
      errors: newErrors,
      hasErrors,
      formData
    });

    return !hasErrors;
  };

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true
    });
    
    // Run validation
    const isValid = validateForm();
    
    if (!isValid) {
      errorToast('Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/users/register", { email: formData.email })
      if(response && response.status === 200) {
        successToast((response.data as { message: string }).message)
        localStorage.setItem("signUpData", JSON.stringify(formData))
        navigate("/users/verify-otp")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/users/auth/google`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 via-blue-500 to-violet-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white text-center">Create Account</h2>
        </div>
        
        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="John Doe"
              />
              {touched.name && errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${touched.username && errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="johndoe123"
              />
              {touched.username && errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="john@example.com"
              />
              {touched.email && errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="(123) 456-7890"
              />
              {touched.phone && errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder='••••••••'
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {touched.password && errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder='••••••••'
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {touched.confirmPassword && errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center gap-2 mt-3"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
          </form>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/users/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;