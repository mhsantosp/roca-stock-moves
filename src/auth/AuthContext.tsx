/**
 * Contexto y provider de autenticación de la aplicación.
 *
 * Responsabilidades:
 * - Almacenar el token de autenticación en memoria (estado React).
 * - Persistir el token en localStorage para mantener la sesión tras recargas.
 * - Exponer operaciones de alto nivel: login y logout.
 *
 * Este contexto es consumido por PrivateRoute y por las pantallas que
 * necesitan conocer el estado de autenticación (por ejemplo, para mostrar
 * un botón de "Cerrar sesión").
 */
import {
  createContext,
  useContext,
  useState,
} from 'react';
import type { ReactNode } from 'react';

interface AuthContextValue {
  /** Token JWT (o similar) cuando el usuario está autenticado, null en caso contrario. */
  token: string | null;
  /** Registra un nuevo token en el contexto y lo persiste en localStorage. */
  login: (token: string) => void;
  /** Elimina el token del contexto y de localStorage (cierra sesión). */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provider de autenticación que envuelve a la aplicación.
 *
 * - Inicializa el estado leyendo "auth_token" desde localStorage para que,
 *   si el usuario recarga la página, la sesión se mantenga.
 * - Proporciona las funciones login/logout al resto de la app.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // El estado inicial lee directamente de localStorage. De esta forma,
  // evitamos un "parpadeo" donde token sería null en el primer render y
  // se cargaría más tarde con un useEffect.
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook de conveniencia para consumir el contexto de autenticación.
 *
 * Lanza una excepción si se usa fuera de un <AuthProvider>, lo que ayuda
 * a detectar errores de uso durante el desarrollo.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}