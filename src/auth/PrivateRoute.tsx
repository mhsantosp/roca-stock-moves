import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PrivateRouteProps {
  children: ReactElement;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Si no hay token, redirige a /login y recuerda desde dónde venía
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}