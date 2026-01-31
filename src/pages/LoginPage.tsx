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
    <div className="page-center">
      <div className="login-layout card login-card">
        <div className="login-illustration">
          {/* Imagen alusiva a inventario/almacén. Debe ubicarse en public/images/login-warehouse.svg */}
          <img src="/images/login-warehouse.svg" alt="Gestión de inventario" />
        </div>
        <div className="card-body">
          <div className="card-header">
            <h1 className="card-title">Login</h1>
            <p className="page-subtitle">
              Accede a la aplicación de movimientos de inventario usando las
              credenciales de prueba.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-field">
              <label className="form-label">
                Usuario
                <input
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            <div className="form-field">
              <label className="form-label">
                Contraseña
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            {errorMessage && (
              <div className="form-error alert-error">{errorMessage}</div>
            )}
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}