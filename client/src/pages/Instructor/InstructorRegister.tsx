import React, { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/apiService'
import { errorToast, successToast } from '../../components/Toast'
import BeatLoader from "react-spinners/BeatLoader"
import { Eye, EyeOff } from 'lucide-react'
import { useEffect } from 'react';

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  title: string;
  yearsOfExperience: string[];
  education: string[];
  documentUrl?: string;
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
    yearsOfExperience: [''],
    education: [''],
    documentUrl: ''
  })
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper functions for array fields
  const handleArrayInputChange = (field: 'education' | 'yearsOfExperience', idx: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? value : item)),
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const handleAddArrayField = (field: 'education' | 'yearsOfExperience') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };
  const handleRemoveArrayField = (field: 'education' | 'yearsOfExperience', idx: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }));
  };

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
    if (!formData.yearsOfExperience.length || formData.yearsOfExperience.some(exp => !exp.trim())) {
      newErrors.yearsOfExperience = 'At least one experience entry is required';
      isValid = false;
    }

    // Education validation
    if (!formData.education.length || formData.education.some(edu => !edu.trim())) {
      newErrors.education = 'At least one education entry is required';
      isValid = false;
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

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF, DOC, DOCX, JPG, and PNG files are allowed');
      setUploading(false);
      return;
    }
    const formDataObj = new FormData();
    formDataObj.append('media', file);
    try {
      const response = await axiosInstance.post('/instructors/upload-registration-document', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.url) {
        setFormData(prev => ({ ...prev, documentUrl: response.data.url }));
      } else {
        setUploadError('Failed to upload document');
      }
    } catch (err) {
      setUploadError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/instructors/register", { email: formData.email })
      if (response.status === 200) {
        // Store the registration data in localStorage (including arrays)
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

  const isFormValid = Object.values(formData).every(value => {
    if (Array.isArray(value)) return value.every(v => v.trim() !== '');
    return value && value.toString().trim() !== '';
  }) && Object.values(errors).every(err => !err);

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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <div>
                {formData.yearsOfExperience.map((exp, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={exp}
                      onChange={e => handleArrayInputChange('yearsOfExperience', idx, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={`Experience #${idx + 1}`}
                    />
                    <button type="button" onClick={() => handleRemoveArrayField('yearsOfExperience', idx)} className="ml-2 text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddArrayField('yearsOfExperience')} className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded">Add Experience</button>
                {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
              </div>
            </div>
            {/* Education */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={edu}
                      onChange={e => handleArrayInputChange('education', idx, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={`Education #${idx + 1}`}
                    />
                    <button type="button" onClick={() => handleRemoveArrayField('education', idx)} className="ml-2 text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddArrayField('education')} className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded">Add Education</button>
                {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
              </div>
            </div>

            {/* Document Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Upload Document (PDF, DOC, Image)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleDocumentChange}
                className="mt-1 block w-full text-sm text-gray-700"
                disabled={uploading}
              />
              {uploading && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
              {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
              {formData.documentUrl && (
                <a href={formData.documentUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 text-sm mt-1 block">Document uploaded. View</a>
              )}
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