/**
 * Página de login de la aplicación.
 *
 * Responsabilidades principales:
 * - Mostrar un formulario sencillo de usuario/contraseña.
 * - Enviar las credenciales a POST /auth/login (API mock con MSW).
 * - Guardar el token devuelto mediante AuthContext y redirigir al listado
 *   de movimientos en caso de éxito.
 * - Mostrar mensajes de error en caso de credenciales inválidas o errores
 *   inesperados (por ejemplo, problemas de red).
 */
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Maneja el envío del formulario de login. Previene el comportamiento
  // por defecto del formulario, marca el estado como "enviando" y realiza
  // la llamada a POST /auth/login. Si la respuesta es correcta, almacena
  // el token y navega al listado; si falla, muestra el mensaje de error.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const msg = errorBody?.message ?? 'Login failed';
        setErrorMessage(msg);
        return;
      }

      const data = (await response.json()) as { token: string };
      login(data.token);
      navigate('/stock-moves', { replace: true });
    } catch (error) {
      setErrorMessage('Unexpected error, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </label>
        </div>
        {errorMessage && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {errorMessage}
          </div>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}