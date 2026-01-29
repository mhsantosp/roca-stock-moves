import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { StockMove } from '../mocks/handlers';
import { useState } from 'react';

interface StockMovesResponse {
  items: StockMove[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchStockMoves(page: number, pageSize: number): Promise<StockMovesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/stock-moves?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to load stock moves');
  }

  return response.json();
}

export function StockMovesListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: rawData, isLoading, isError, error } = useQuery<StockMovesResponse>({
    queryKey: ['stock-moves', page, pageSize],
    queryFn: () => fetchStockMoves(page, pageSize),
  });
  // Hacemos un cast explícito para que TS deje de tratarlo como {}
  const data = rawData as StockMovesResponse | undefined;

  if (isLoading) {
    return <div style={{ padding: '1rem' }}>Cargando movimientos...</div>;
  }

  if (isError) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        Error al cargar movimientos:{' '}
        {error instanceof Error ? error.message : 'Error desconocido'}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <div style={{ padding: '1rem' }}>No hay movimientos.</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Movimientos de Inventario</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Fecha</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Producto</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Bodega</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Tipo</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Cantidad</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Referencia</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((move) => (
            <tr key={move.id}>
              <td>{move.date}</td>
              <td>{move.product}</td>
              <td>{move.warehouse}</td>
              <td>{move.type}</td>
              <td style={{ textAlign: 'right' }}>{move.quantity}</td>
              <td>{move.reference}</td>
              <td>
                <Link to={`/stock-moves/${move.id}`}>Ver detalle</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>
          Página {data.page} de {Math.ceil(data.total / data.pageSize)} ({data.total} registros)
        </span>
        <button
          type="button"
          onClick={() => {
            const totalPages = Math.ceil(data.total / data.pageSize);
            setPage((prev) => Math.min(prev + 1, totalPages));
          }}
          disabled={data.items.length === 0 || data.page >= Math.ceil(data.total / data.pageSize)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}