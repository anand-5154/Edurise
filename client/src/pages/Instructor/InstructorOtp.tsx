import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/apiService'
import { successToast, errorToast } from '../../components/Toast'
import BeatLoader from "react-spinners/BeatLoader"

const InstructorOtp = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate()

  // Initialize timer
  useEffect(() => {
    const initializeTimer = () => {
      const savedTime = sessionStorage.getItem('otpTimer')
      const currentTime = Date.now()
      
      if (savedTime) {
        const timeDiff = Math.floor((currentTime - parseInt(savedTime)) / 1000)
        const remainingTime = Math.max(0, 60 - timeDiff)
        setTimeLeft(remainingTime)
        setCanResend(remainingTime === 0)
        
        if (remainingTime > 0) {
          return remainingTime
        }
      }
      
      // If no saved time or expired, start new timer
      sessionStorage.setItem('otpTimer', currentTime.toString())
      return 60
    }

    const remainingTime = initializeTimer()
    let timer: NodeJS.Timeout

    if (remainingTime > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          if (newTime <= 0) {
            clearInterval(timer)
            setCanResend(true)
            sessionStorage.removeItem('otpTimer')
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      errorToast('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post('/instructor/verify-otp', { otp })
      successToast('Instructor Registered Successfully, Waiting for approval')
      navigate('/instructor/login')
    } catch (err: any) {
      errorToast(err.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return

    setLoading(true)
    try {
      await axiosInstance.post('/instructor/resend-otp')
      successToast('OTP resent successfully')
      
      // Reset timer
      sessionStorage.setItem('otpTimer', Date.now().toString())
      setTimeLeft(60)
      setCanResend(false)
      
      // Start new timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          if (newTime <= 0) {
            clearInterval(timer)
            setCanResend(true)
            sessionStorage.removeItem('otpTimer')
            return 0
          }
          return newTime
        })
      }, 1000)
    } catch (err: any) {
      errorToast(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {timeLeft > 0 ? (
                  <span className="text-gray-500">
                    Resend OTP in {timeLeft} seconds
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-medium text-purple-600 hover:text-purple-500"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <BeatLoader color="#ffffff" size={8} />
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InstructorOtp 