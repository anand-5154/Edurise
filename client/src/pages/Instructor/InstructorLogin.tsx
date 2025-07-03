import React, { FormEvent, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/apiService'
import { errorToast, successToast } from '../../components/Toast'
import BeatLoader from "react-spinners/BeatLoader"
import { Eye, EyeOff } from 'lucide-react'

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  isVerified: boolean;
  accountStatus: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function InstructorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const navigate = useNavigate()

  // Validate email on change
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Please enter your email address'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address (e.g., john@example.com)'
    }
    return undefined
  }

  // Validate password on change
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Please enter your password'
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return undefined
  }

  // Update errors when email changes
  useEffect(() => {
    if (email) {
      const emailError = validateEmail(email)
      setErrors(prev => ({
        ...prev,
        email: emailError
      }))
    }
  }, [email])

  // Update errors when password changes
  useEffect(() => {
    if (password) {
      const passwordError = validatePassword(password)
      setErrors(prev => ({
        ...prev,
        password: passwordError
      }))
    }
  }, [password])

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
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post<LoginResponse>("/instructors/login", { email, password })
      if (response && response.status === 200) {
        const { accessToken, refreshToken, isVerified, accountStatus } = response.data;
        
        if (!isVerified) {
          errorToast("Your account is not verified. Please complete verification first.");
          return;
        }

        // Store the token
        localStorage.setItem('instructorAccessToken', accessToken);
        localStorage.setItem('instructorRefreshToken', refreshToken);
        
        // Show appropriate message based on account status
        if (accountStatus === 'pending') {
          successToast("Login successful. Your account is pending approval.");
        } else {
          successToast("Login successful");
        }
        console.log('Navigating to dashboard');
        navigate('/instructors/dashboard');
      }
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = email.trim() !== '' && password.trim() !== ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/instructors/register" className="font-medium text-purple-600 hover:text-purple-500">
              register as an instructor
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/instructors/forgotpassword" className="font-medium text-purple-600 hover:text-purple-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isFormValid && !isLoading
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-purple-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isLoading ? (
                <BeatLoader color="#ffffff" size={8} />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}