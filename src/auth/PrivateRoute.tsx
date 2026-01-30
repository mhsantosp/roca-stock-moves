/**
 * Componente de orden superior para proteger rutas que requieren autenticación.
 *
 * Uso típico:
 *
 * <Route
 *   path="/ruta-protegida"
 *   element={
 *     <PrivateRoute>
 *       <MiPaginaProtegida />
 *     </PrivateRoute>
 *   }
 * />
 *
 * Comportamiento:
 * - Si existe un token en el AuthContext, renderiza los children.
 * - Si NO existe token, redirige a /login y guarda en el state de la
 *   navegación la ubicación original (location) para poder, si se desea,
 *   redirigir de vuelta tras autenticarse.
 */
import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PrivateRouteProps {
  /** Elemento React que solo debe verse cuando el usuario está autenticado. */
  children: ReactElement;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Si no hay token, redirige a /login y recuerda desde dónde venía el usuario
    // mediante "state.from". Esto permite implementar una redirección de
    // vuelta después de un login exitoso, si en el futuro se desea.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}