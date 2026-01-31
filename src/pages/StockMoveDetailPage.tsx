import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StockMove } from '../mocks/handlers';


async function fetchStockMove(id: string): Promise<StockMove> {
  const response = await fetch(`/stock-moves/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load stock move detail');
  }
  return response.json();
}

interface PatchPayload {
  id: string;
  reference: string;
}

async function patchStockMoveReference({ id, reference }: PatchPayload): Promise<StockMove> {
  const response = await fetch(`/stock-moves/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message ?? 'Failed to update reference';
    throw new Error(msg);
  }

  return response.json();
}

export function StockMoveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reference, setReference] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<StockMove>({
    queryKey: ['stock-move', id],
    queryFn: () => fetchStockMove(id as string),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: patchStockMoveReference,
    // Optimistic update
    onMutate: async ({ id, reference }) => {
      setFormError(null);
      setSuccessMessage(null);

      // Cancelar queries en curso relacionadas
      await queryClient.cancelQueries({ queryKey: ['stock-move', id] });
      await queryClient.cancelQueries({ queryKey: ['stock-moves'] });

      // Snapshot del detalle previo
      const previousDetail = queryClient.getQueryData<StockMove>(['stock-move', id]);

      // Snapshot de todas las listas de stock-moves en cache
      const previousLists = queryClient.getQueriesData<{
        items: StockMove[];
        total: number;
        page: number;
        pageSize: number;
      }>({ queryKey: ['stock-moves'] });

      // Actualizar detalle en cache
      if (previousDetail) {
        queryClient.setQueryData<StockMove>(['stock-move', id], {
          ...previousDetail,
          reference,
        });
      }

      // Actualizar todas las listas que contengan ese id
      previousLists.forEach(([key, value]) => {
        if (!value) return;
        const updatedItems = value.items.map((item) =>
          item.id === id ? { ...item, reference } : item,
        );
        queryClient.setQueryData(key, { ...value, items: updatedItems });
      });

      // Devolver contexto para poder revertir en onError
      return { previousDetail, previousLists };
    },
    onError: (err: unknown, _variables, context) => {
      // Revertir detalle
      if (context?.previousDetail) {
        queryClient.setQueryData<StockMove>(
          ['stock-move', context.previousDetail.id],
          context.previousDetail,
        );
      }

      // Revertir listas
      if (context?.previousLists) {
        context.previousLists.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }

      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Error al actualizar la referencia.');
      }
    },
    onSuccess: () => {
      setSuccessMessage('Referencia actualizada correctamente.');
    },
    onSettled: (_data, _error, variables) => {
      // Asegurar sincronización final con el servidor
      queryClient.invalidateQueries({ queryKey: ['stock-move', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stock-moves'] });
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (data) {
      setReference(data.reference);
    }
  }, [data]);

  if (!id) {
    return <div className="page-container">ID de movimiento no proporcionado.</div>;
  }

  if (isLoading) {
    return <div className="page-container">Cargando detalle...</div>;
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="alert-error">
          Error al cargar detalle:{' '}
          {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="page-container">Movimiento no encontrado.</div>;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmed = reference.trim();
    if (trimmed.length < 3 || trimmed.length > 60) {
      setFormError('La referencia debe tener entre 3 y 60 caracteres.');
      return;
    }

    mutation.mutate({ id: data.id, reference: trimmed });
  };

  return (
    <div className="page-container">
      <button
        className="btn-link"
        type="button"
        onClick={() => navigate('/stock-moves')}
      >
        ← Volver al listado
      </button>

      <div className="page-header layout-main">
        <div>
          <h2 className="page-title">Detalle de Movimiento</h2>
          <p className="page-subtitle">
            Revisa la información del movimiento y actualiza la referencia asociada.
          </p>
        </div>
        <div className="page-actions">
          {/* Pequeño icono/imagen alusiva a detalle de documento */}
          <img
            src="/images/move-detail.svg"
            alt="Detalle de movimiento"
            style={{ width: '48px', height: '48px' }}
          />
        </div>
      </div>

      <div className="detail-layout">
        <div className="card">
          <div className="card-body">
            <div>
              <div className="detail-section-title">Información general</div>
              <div className="meta">
                <div className="meta-item">
                  <strong>ID:</strong> {data.id}
                </div>
                <div className="meta-item">
                  <strong>Fecha:</strong> {data.date}
                </div>
                <div className="meta-item">
                  <strong>Producto:</strong> {data.product}
                </div>
                <div className="meta-item">
                  <strong>Bodega:</strong> {data.warehouse}
                </div>
              </div>
            </div>
            <div>
              <div className="meta">
                <div className="meta-item">
                  <strong>Tipo:</strong> {data.type}
                </div>
                <div className="meta-item">
                  <strong>Cantidad:</strong> {data.quantity}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="detail-section-title">Editar referencia</div>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-field">
                <label className="form-label">
                  Referencia
                  <input
                    className="form-input"
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    disabled={mutation.isLoading}
                  />
                </label>
                <p className="form-help">
                  Entre 3 y 60 caracteres. Por ejemplo: código de orden, número de
                  documento, etc.
                </p>
              </div>

              {formError && <div className="alert-error">{formError}</div>}

              {successMessage && (
                <div className="alert-success">{successMessage}</div>
              )}

              <button
                className="btn-primary"
                type="submit"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}