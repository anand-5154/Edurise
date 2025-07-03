import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { successToast, errorToast } from '../components/Toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      errorToast(error);
      navigate('/users/login');
      return;
    }

    if (accessToken && refreshToken) {
      // Store the tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      successToast('Login successful');
      navigate('/');
    } else {
      errorToast('Authentication failed');
      navigate('/users/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Completing login...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  );
} 