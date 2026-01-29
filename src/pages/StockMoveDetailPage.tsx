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
    return <div style={{ padding: '1rem' }}>ID de movimiento no proporcionado.</div>;
  }

  if (isLoading) {
    return <div style={{ padding: '1rem' }}>Cargando detalle...</div>;
  }

  if (isError) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        Error al cargar detalle:{' '}
        {error instanceof Error ? error.message : 'Error desconocido'}
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: '1rem' }}>Movimiento no encontrado.</div>;
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
    <div style={{ padding: '1rem' }}>
      <button type="button" onClick={() => navigate('/stock-moves')}>
        ← Volver al listado
      </button>

      <h1>Detalle de Movimiento</h1>

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <p><strong>ID:</strong> {data.id}</p>
        <p><strong>Fecha:</strong> {data.date}</p>
        <p><strong>Producto:</strong> {data.product}</p>
        <p><strong>Bodega:</strong> {data.warehouse}</p>
        <p><strong>Tipo:</strong> {data.type}</p>
        <p><strong>Cantidad:</strong> {data.quantity}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Referencia
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={mutation.isLoading}
              style={{ display: 'block', width: '100%' }}
            />
          </label>
        </div>

        {formError && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>{formError}</div>
        )}

        {successMessage && (
          <div style={{ color: 'green', marginBottom: '1rem' }}>{successMessage}</div>
        )}

        <button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}