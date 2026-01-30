/**
 * Página de listado de movimientos de inventario.
 *
 * Responsabilidades principales:
 * - Consultar la API de movimientos con paginación y filtros (producto, bodega, tipo).
 * - Sincronizar filtros y página actual con la URL mediante useSearchParams, de modo que
 *   el estado de la vista sea compartible (copy/paste de la URL).
 * - Mostrar estados de carga, error, vacío y la tabla de resultados.
 */
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import type { StockMove } from '../mocks/handlers';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * Forma esperada de la respuesta de la API GET /stock-moves.
 * Se modela explícitamente para dejar claro que la API soporta paginación
 * tipo servidor (total + page + pageSize) además de la lista de items.
 */
interface StockMovesResponse {
  items: StockMove[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Función de ayuda para invocar GET /stock-moves con paginación y filtros.
 *
 * No se usa directamente en componentes, sino como queryFn de React Query
 * en StockMovesListPage. Recibe la página actual, el tamaño de página y
 * los filtros, construye la query string correspondiente y valida la
 * respuesta HTTP.
 */
async function fetchStockMoves(
  page: number,
  pageSize: number,
  product: string,
  warehouse: string,
  type: string,
): Promise<StockMovesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  // Solo añadimos parámetros de filtro si tienen valor, para no contaminar
  // la URL con filtros vacíos.
  if (product) {
    params.set('product', product);
  }
  if (warehouse) {
    params.set('warehouse', warehouse);
  }
  if (type) {
    params.set('type', type);
  }

  const response = await fetch(`/stock-moves?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to load stock moves');
  }

  return response.json();
}

export function StockMovesListPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Valores iniciales de filtros y página leídos desde la URL. Esto permite
  // que si el usuario comparte la URL o recarga, la vista se reconstruya
  // con los mismos criterios de búsqueda y paginación.
  const initialPage = Number(searchParams.get('page') ?? '1') || 1;
  const initialProduct = searchParams.get('product') ?? '';
  const initialWarehouse = searchParams.get('warehouse') ?? '';
  const initialType = searchParams.get('type') ?? '';

  const [page, setPage] = useState(initialPage);
  const pageSize = 10;
  const [productFilter, setProductFilter] = useState(initialProduct);
  const [warehouseFilter, setWarehouseFilter] = useState(initialWarehouse);
  const [typeFilter, setTypeFilter] = useState(initialType);

  // Query principal que trae los movimientos desde la API mock.
  // La queryKey incluye page, pageSize y filtros para que React Query distinga
  // correctamente entre distintas combinaciones (paginación + filtros).
  const { data: rawData, isLoading, isError, error } = useQuery<StockMovesResponse>({
    queryKey: ['stock-moves', page, pageSize, productFilter, warehouseFilter, typeFilter],
    queryFn: () =>
      fetchStockMoves(page, pageSize, productFilter, warehouseFilter, typeFilter),
  });
  // Hacemos un cast explícito para que TS deje de tratarlo como {}
  const data = rawData as StockMovesResponse | undefined;

  // Estado de carga mientras la query está en curso.
  if (isLoading) {
    return <div style={{ padding: '1rem' }}>Cargando movimientos...</div>;
  }

  // Estado de error cuando la query falla (por ejemplo, error de red).
  if (isError) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        Error al cargar movimientos:{' '}
        {error instanceof Error ? error.message : 'Error desconocido'}
      </div>
    );
  }

  // Estado cuando la API responde correctamente pero no hay datos.
  if (!data || data.items.length === 0) {
    return <div style={{ padding: '1rem' }}>No hay movimientos.</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Cabecera con título de la página y botón de cierre de sesión */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Movimientos de Inventario</h2>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Salir
        </button>
      </div>

      {/*
        Formulario de filtros. No tiene submit "real"; cada cambio en los
        campos dispara inmediatamente una actualización de estado y de la URL,
        lo que a su vez provoca un nuevo fetch desde React Query.
      */}
      <form
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label>
            Producto
            <input
              type="text"
              value={productFilter}
              onChange={(e) => {
                const value = e.target.value;
                setProductFilter(value);
                setPage(1);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set('page', '1');
                  if (value) {
                    params.set('product', value);
                  } else {
                    params.delete('product');
                  }
                  if (warehouseFilter) params.set('warehouse', warehouseFilter); else params.delete('warehouse');
                  if (typeFilter) params.set('type', typeFilter); else params.delete('type');
                  return params;
                });
              }}
            />
          </label>
        </div>

        <div>
          <label>
            Bodega
            <select
              value={warehouseFilter}
              onChange={(e) => {
                const value = e.target.value;
                setWarehouseFilter(value);
                setPage(1);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set('page', '1');
                  if (productFilter) params.set('product', productFilter); else params.delete('product');
                  if (value) {
                    params.set('warehouse', value);
                  } else {
                    params.delete('warehouse');
                  }
                  if (typeFilter) params.set('type', typeFilter); else params.delete('type');
                  return params;
                });
              }}
            >
              <option value="">Todas</option>
              <option value="Bodega Norte">Bodega Norte</option>
              <option value="Bodega Sur">Bodega Sur</option>
              <option value="Bodega Central">Bodega Central</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Tipo
            <select
              value={typeFilter}
              onChange={(e) => {
                const value = e.target.value;
                setTypeFilter(value);
                setPage(1);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set('page', '1');
                  if (productFilter) params.set('product', productFilter); else params.delete('product');
                  if (warehouseFilter) params.set('warehouse', warehouseFilter); else params.delete('warehouse');
                  if (value) {
                    params.set('type', value);
                  } else {
                    params.delete('type');
                  }
                  return params;
                });
              }}
            >
              <option value="">Todos</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUST">ADJUST</option>
            </select>
          </label>
        </div>
      </form>

      {/* Tabla principal con el resultado de la búsqueda */}
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
      {/* Controles de paginación tipo servidor */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            const newPage = Math.max(page - 1, 1);
            setPage(newPage);
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set('page', String(newPage));
              if (productFilter) params.set('product', productFilter); else params.delete('product');
              if (warehouseFilter) params.set('warehouse', warehouseFilter); else params.delete('warehouse');
              if (typeFilter) params.set('type', typeFilter); else params.delete('type');
              return params;
            });
          }}
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
            const newPage = Math.min(page + 1, totalPages);
            setPage(newPage);
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set('page', String(newPage));
              if (productFilter) params.set('product', productFilter); else params.delete('product');
              if (warehouseFilter) params.set('warehouse', warehouseFilter); else params.delete('warehouse');
              if (typeFilter) params.set('type', typeFilter); else params.delete('type');
              return params;
            });
          }}
          disabled={data.items.length === 0 || data.page >= Math.ceil(data.total / data.pageSize)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}