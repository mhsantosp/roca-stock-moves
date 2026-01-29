import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../auth/AuthContext';

describe('LoginPage', () => {
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