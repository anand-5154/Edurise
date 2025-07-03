import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  role: 'admin' | 'instructor' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  let token = null;
  if (role === 'instructor') {
    token = localStorage.getItem('instructorAccessToken');
  } else if (role === 'admin') {
    token = localStorage.getItem('adminAccessToken');
  } else {
    token = localStorage.getItem('accessToken');
  }
  if (!token) {
    return <Navigate to={`/${role}s/login`} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute; 