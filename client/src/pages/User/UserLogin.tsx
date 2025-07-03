import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import type { FormEvent } from 'react';
import axiosInstance from '../../services/apiService';
import { successToast, errorToast } from "../../components/Toast";
import { useNavigate, Link } from 'react-router-dom';

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState({ email: false, password: false })
  const navigate = useNavigate()

  // Validate email on change
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Please enter your email address'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address'
    }
    return undefined
  }

  // Validate password on change
  const validatePassword = (password: string): string | undefined => {
    if (!password.trim()) {
      return 'Please enter your password'
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return undefined
  }

  // Update errors when email changes
  useEffect(() => {
    if (touched.email) {
      const emailError = validateEmail(email)
      setErrors(prev => ({
        ...prev,
        email: emailError
      }))
    }
  }, [email, touched.email])

  // Update errors when password changes
  useEffect(() => {
    if (touched.password) {
      const passwordError = validatePassword(password)
      setErrors(prev => ({
        ...prev,
        password: passwordError
      }))
    }
  }, [password, touched.password])

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const validateForm = (): boolean => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    setErrors({
      email: emailError,
      password: passwordError
    })

    return !emailError && !passwordError
  }

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Mark all fields as touched on submit
    setTouched({ email: true, password: true })
    
    if (!validateForm()) {
      errorToast('Please fix the form errors before submitting')
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post<LoginResponse>("/users/login", { email, password })
      if (response && response.status === 200) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        successToast("Login Successful")
        setTimeout(() => {
          navigate("/")
        }, 2000);
      }
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/users/auth/google`;
  }

  const isFormValid = email.trim() !== '' && password.trim() !== '' && !errors.email && !errors.password

  return (
    <div className="w-full max-w-md mx-auto p-6 mt-35 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
        <p className="text-gray-600 mt-2">Enter your credentials to sign in</p>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full py-2 pl-10 pr-4 border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="you@example.com"
              />
            </div>
            {touched.email && errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full py-2 pl-10 pr-10 border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center"></div>
            <div className="text-sm">
              <Link to="/users/forgotpassword" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading || !isFormValid}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/users/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}