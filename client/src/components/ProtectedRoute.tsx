import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  role: 'admin' | 'instructor' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const token = localStorage.getItem(`${role}Token`);
  
  if (!token) {
    return <Navigate to={`/${role}s/login`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 