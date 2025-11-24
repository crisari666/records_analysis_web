import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

type UserRole = 'root' | 'admin' | 'user';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (allowedRoles && allowedRoles.length > 0 && isAuthenticated && user) {
    if (!user || !user.role || !allowedRoles.includes(user.role as UserRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
