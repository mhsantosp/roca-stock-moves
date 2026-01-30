/**
 * Tests de la página de listado de movimientos.
 *
 * Estos tests verifican principalmente el ciclo de vida básico del componente:
 * - Estado de carga inicial ("Cargando movimientos...").
 * - Renderizado de la tabla una vez que la "API" responde.
 *
 * Al igual que en LoginPage.test.tsx, se mockea global.fetch con vi.spyOn
 * para controlar la respuesta de la API y desacoplarse de MSW en el entorno
 * de tests unitarios.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StockMovesListPage } from './StockMovesListPage';

// Usamos un QueryClient aislado para los tests
function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/stock-moves']}>
        <Routes>
          <Route path="/stock-moves" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('StockMovesListPage', () => {
  /**
   * Verifica que la página muestre primero el estado de carga y, tras
   * recibir datos de la API mockeada, renderice la tabla con al menos
   * un producto.
   */
  it('muestra estado de carga y luego la tabla', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: '1',
              date: '2025-01-01',
              product: 'Producto A',
              warehouse: 'Bodega Norte',
              type: 'IN',
              quantity: 100,
              reference: 'Ingreso inicial',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
      } as Response);
    renderWithClient(<StockMovesListPage />);
    // Loading primero
    expect(screen.getByText(/Cargando movimientos/i)).toBeInTheDocument();
    // Luego ya debe aparecer el título de la tabla
    await waitFor(() => {
      expect(
        screen.getByText(/Movimientos de Inventario/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Producto A/i)).toBeInTheDocument();
    fetchMock.mockRestore();
  });
});