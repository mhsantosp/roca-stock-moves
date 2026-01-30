/**
 * Tests de la página de Login.
 *
 * No se usa MSW directamente aquí; en su lugar se mockea global.fetch con vi.spyOn
 * para controlar de forma precisa las respuestas de la "API" y probar el
 * comportamiento del componente ante distintos escenarios.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../auth/AuthContext';

describe('LoginPage', () => {
  /**
   * Verifica que se muestre un error cuando se intenta hacer login con credenciales inválidas.
   *
   * En este escenario, se mockea la respuesta de la API para que devuelva un error de credenciales inválidas.
   * Luego, se verifica que se muestre el mensaje de error correspondiente en la pantalla.
   */
  it('muestra error con credenciales inválidas', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      } as Response);
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    const userInput = screen.getByLabelText(/Usuario/i);
    fireEvent.change(userInput, { target: { value: 'otro' } });
    const button = screen.getByRole('button', { name: /login/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    fetchMock.mockRestore();
  });

  /**
   * Verifica que se haga login exitoso y se navegue al listado después de un login exitoso.
   *
   * En este escenario, se mockea la respuesta de la API para que devuelva un token de autenticación válido.
   * Luego, se verifica que se navegue al listado después de hacer clic en el botón de login.
   *
   * Este test se deja como referencia (skip) para ilustrar cómo se podría comprobar la navegación al listado después de un login exitoso.
   */
  it.skip('hace login exitoso y navega al listado', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'fake-token-123' }),
      } as Response);
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/stock-moves" element={<div>Listado Mock</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    const [button] = screen.getAllByRole('button', { name: /login/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/Listado Mock/i)).toBeInTheDocument();
    });
    fetchMock.mockRestore();
  });
});