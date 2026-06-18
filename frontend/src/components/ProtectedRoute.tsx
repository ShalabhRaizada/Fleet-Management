import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && roles.length && user && !roles.includes(user.role_code)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
