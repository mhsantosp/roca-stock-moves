import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import type { StockMove } from '../mocks/handlers';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

interface StockMovesResponse {
  items: StockMove[];
  total: number;
  page: number;
  pageSize: number;
}

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
  const initialPage = Number(searchParams.get('page') ?? '1') || 1;
  const initialProduct = searchParams.get('product') ?? '';
  const initialWarehouse = searchParams.get('warehouse') ?? '';
  const initialType = searchParams.get('type') ?? '';
  const [page, setPage] = useState(initialPage);
  const pageSize = 10;
  const [productFilter, setProductFilter] = useState(initialProduct);
  const [warehouseFilter, setWarehouseFilter] = useState(initialWarehouse);
  const [typeFilter, setTypeFilter] = useState(initialType);

  const { data: rawData, isLoading, isError, error } = useQuery<StockMovesResponse>({
    queryKey: ['stock-moves', page, pageSize, productFilter, warehouseFilter, typeFilter],
    queryFn: () =>
      fetchStockMoves(page, pageSize, productFilter, warehouseFilter, typeFilter),
  });
  // Hacemos un cast explícito para que TS deje de tratarlo como {}
  const data = rawData as StockMovesResponse | undefined;

  if (isLoading) {
    return <div className="page-container">Cargando movimientos...</div>;
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="alert-error">
          Error al cargar movimientos:{' '}
          {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2 className="page-title">Movimientos de Inventario</h2>
            <p className="page-subtitle">Revisa y filtra los movimientos registrados.</p>
          </div>
          <div className="page-actions">
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              Salir
            </button>
          </div>
        </div>
        <div className="empty-state">
          {/* Imagen de estado vacío, p.ej. public/images/inventory-empty.svg */}
          <img src="/images/inventory-empty.svg" alt="Sin movimientos" />
          <div>
            <h3>No hay movimientos.</h3>
            <p>Intenta ajustar los filtros o cargar nuevos datos de inventario.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Movimientos de Inventario</h2>
          <p className="page-subtitle">
            Consulta los movimientos registrados y filtra por producto, bodega y tipo.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <div className="layout-table card">
        <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
          <div className="form-field">
            <label className="form-label">
              Producto
              <input
                className="form-input"
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

          <div className="form-field">
            <label className="form-label">
              Bodega
              <select
                className="form-select"
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

          <div className="form-field">
            <label className="form-label">
              Tipo
              <select
                className="form-select"
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

        <div className="table-wrapper">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Bodega</th>
                <th>Tipo</th>
                <th className="numeric">Cantidad</th>
                <th>Referencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((move) => (
                <tr key={move.id}>
                  <td>{move.date}</td>
                  <td>{move.product}</td>
                  <td>{move.warehouse}</td>
                  <td>
                    {move.type === 'IN' && <span className="chip-in">IN</span>}
                    {move.type === 'OUT' && <span className="chip-out">OUT</span>}
                    {move.type === 'ADJUST' && <span className="chip-adjust">ADJUST</span>}
                  </td>
                  <td className="numeric">{move.quantity}</td>
                  <td>{move.reference}</td>
                  <td>
                    <Link to={`/stock-moves/${move.id}`}>Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            className="btn-secondary btn-sm"
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
            className="btn-secondary btn-sm"
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
    </div>
  );
}