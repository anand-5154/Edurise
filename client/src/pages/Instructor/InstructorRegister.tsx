import React, { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/apiService'
import { errorToast, successToast } from '../../components/Toast'
import BeatLoader from "react-spinners/BeatLoader"
import { Eye, EyeOff } from 'lucide-react'

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  title: string;
  yearsOfExperience: string;
  education: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  title?: string;
  yearsOfExperience?: string;
  education?: string;
}

export default function InstructorRegister() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    title: '',
    yearsOfExperience: '',
    education: ''
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
      isValid = false
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
      isValid = false
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
      isValid = false
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
      isValid = false
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
      isValid = false
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
      isValid = false
    }

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
      isValid = false
    }

    // Years of experience validation
    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required'
      isValid = false
    } else if (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0) {
      newErrors.yearsOfExperience = 'Please enter a valid number of years'
      isValid = false
    }

    // Education validation
    if (!formData.education.trim()) {
      newErrors.education = 'Education details are required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/instructors/register", { email: formData.email })
      if (response.status === 200) {
        // Store the registration data in localStorage
        localStorage.setItem('instructorSignUpData', JSON.stringify(formData))
        successToast("OTP sent successfully")
        navigate('/instructors/verify-otp')
      }
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && !Object.keys(errors).length

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Register as an Instructor</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/instructors/login" className="font-medium text-purple-600 hover:text-purple-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Years of Experience */}
            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                id="yearsOfExperience"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.yearsOfExperience ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
            </div>

            {/* Education */}
            <div className="sm:col-span-2">
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
              <textarea
                name="education"
                id="education"
                rows={3}
                value={formData.education}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.education ? 'border-red-300' : 'border-gray-300'
                } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isFormValid && !isLoading
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-purple-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isLoading ? (
                <BeatLoader color="#ffffff" size={8} />
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}