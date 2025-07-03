import React, { FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/apiService'
import { errorToast, successToast } from '../../components/Toast'
import BeatLoader from "react-spinners/BeatLoader"

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

export default function InstructorVerifyOTP() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationData, setRegistrationData] = useState<FormData | null>(null)

  useEffect(() => {
    // Retrieve registration data from localStorage
    const storedData = localStorage.getItem('instructorSignUpData')
    if (!storedData) {
      errorToast('Registration data not found. Please register again.')
      navigate('/instructors/register')
      return
    }

    try {
      const parsedData = JSON.parse(storedData)
      setRegistrationData(parsedData)
    } catch (error) {
      errorToast('Invalid registration data. Please register again.')
      navigate('/instructors/register')
    }
  }, [navigate])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!registrationData) {
      errorToast('Registration data not found. Please register again.')
      navigate('/instructors/register')
      return
    }

    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/instructors/verify-otp", {
        email: registrationData.email,
        otp,
        ...registrationData
      })

      if (response.status === 201) {
        successToast("Registration successful! Please wait for admin approval.")
        // Clear the registration data from localStorage
        localStorage.removeItem('instructorSignUpData')
        navigate('/instructors/login')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "OTP verification failed"
      setError(errorMessage)
      errorToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!registrationData) {
      errorToast('Registration data not found. Please register again.')
      navigate('/instructors/register')
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/instructors/register", {
        email: registrationData.email
      })
      if (response.status === 200) {
        successToast("OTP resent successfully")
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to resend OTP"
      errorToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter the OTP sent to your email address
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                setError('')
              }}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                error ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
              placeholder="Enter OTP"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                !isLoading
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-purple-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isLoading ? (
                <BeatLoader color="#ffffff" size={8} />
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Didn't receive OTP? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 