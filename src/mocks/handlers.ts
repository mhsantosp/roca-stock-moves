import { http, HttpResponse } from 'msw';

// Tipo base para los movimientos de inventario - modelo -
export interface StockMove {
  id: string;
  date: string;
  product: string;
  warehouse: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reference: string;
}

// Datos mock en memoria
const stockMoves: StockMove[] = [
  {
    id: '1',
    date: '2025-01-01',
    product: 'Producto A',
    warehouse: 'Bodega Norte',
    type: 'IN',
    quantity: 100,
    reference: 'Ingreso inicial',
  },
  {
    id: '2',
    date: '2025-01-02',
    product: 'Producto B',
    warehouse: 'Bodega Sur',
    type: 'OUT',
    quantity: 20,
    reference: 'Venta cliente X',
  }
];

// Aquí iremos agregando los endpoints
export const handlers = [
  // POST /auth/login
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };

    if (body.username === 'admin' && body.password === 'admin') {
      return HttpResponse.json({ token: 'fake-token-123' }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // GET /stock-moves
  http.get('/stock-moves', ({ request }) => {
    // Lógica de filtros y paginación la completamos en el siguiente paso
    return HttpResponse.json({
      items: stockMoves,
      total: stockMoves.length,
      page: 1,
      pageSize: stockMoves.length,
    });
  }),

  // GET /stock-moves/:id
  http.get('/stock-moves/:id', ({ params }) => {
    const { id } = params;
    const move = stockMoves.find((m) => m.id === id);

    if (!move) {
      return HttpResponse.json(
        { message: 'Stock move not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(move, { status: 200 });
  }),

  // PATCH /stock-moves/:id
  http.patch('/stock-moves/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { reference?: string };

    const reference = body.reference ?? '';

    if (reference.length < 3 || reference.length > 60) {
      return HttpResponse.json(
        { message: 'Reference must be between 3 and 60 characters' },
        { status: 400 }
      );
    }

    const moveIndex = stockMoves.findIndex((m) => m.id === id);
    if (moveIndex === -1) {
      return HttpResponse.json(
        { message: 'Stock move not found' },
        { status: 404 }
      );
    }

    stockMoves[moveIndex] = {
      ...stockMoves[moveIndex],
      reference,
    };

    return HttpResponse.json(stockMoves[moveIndex], { status: 200 });
  }),
];