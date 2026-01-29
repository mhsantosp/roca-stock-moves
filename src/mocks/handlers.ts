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
  },
  {
    id: '3',
    date: '2025-01-03',
    product: 'Producto C',
    warehouse: 'Bodega Norte',
    type: 'ADJUST',
    quantity: -5,
    reference: 'Ajuste inventario',
  },
  {
    id: '4',
    date: '2025-01-04',
    product: 'Producto A',
    warehouse: 'Bodega Central',
    type: 'OUT',
    quantity: 15,
    reference: 'Salida a sucursal',
  },
  {
    id: '5',
    date: '2025-01-05',
    product: 'Producto D',
    warehouse: 'Bodega Norte',
    type: 'IN',
    quantity: 200,
    reference: 'Compra proveedor Y',
  },
  {
    id: '6',
    date: '2025-01-06',
    product: 'Producto B',
    warehouse: 'Bodega Sur',
    type: 'ADJUST',
    quantity: 3,
    reference: 'Reconteo físico',
  },
  {
    id: '7',
    date: '2025-01-07',
    product: 'Producto E',
    warehouse: 'Bodega Central',
    type: 'IN',
    quantity: 50,
    reference: 'Ingreso promoción',
  },
  {
    id: '8',
    date: '2025-01-08',
    product: 'Producto C',
    warehouse: 'Bodega Norte',
    type: 'OUT',
    quantity: 30,
    reference: 'Salida orden 123',
  },
  {
    id: '9',
    date: '2025-01-09',
    product: 'Producto A',
    warehouse: 'Bodega Sur',
    type: 'OUT',
    quantity: 10,
    reference: 'Devolución cliente',
  },
  {
    id: '10',
    date: '2025-01-10',
    product: 'Producto D',
    warehouse: 'Bodega Central',
    type: 'IN',
    quantity: 80,
    reference: 'Reposición stock',
  },
  {
    id: '11',
    date: '2025-01-11',
    product: 'Producto E',
    warehouse: 'Bodega Norte',
    type: 'OUT',
    quantity: 25,
    reference: 'Transferencia interna',
  },
  {
    id: '12',
    date: '2025-01-12',
    product: 'Producto B',
    warehouse: 'Bodega Sur',
    type: 'IN',
    quantity: 60,
    reference: 'Compra urgente',
  },
  {
    id: '13',
    date: '2025-01-13',
    product: 'Producto C',
    warehouse: 'Bodega Central',
    type: 'ADJUST',
    quantity: -2,
    reference: 'Pérdida por daño',
  },
  {
    id: '14',
    date: '2025-01-14',
    product: 'Producto A',
    warehouse: 'Bodega Norte',
    type: 'IN',
    quantity: 120,
    reference: 'Ingreso campaña',
  },
  {
    id: '15',
    date: '2025-01-15',
    product: 'Producto D',
    warehouse: 'Bodega Sur',
    type: 'OUT',
    quantity: 40,
    reference: 'Salida mayorista',
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
    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page') ?? '1';
    const pageSizeParam = url.searchParams.get('pageSize') ?? '10';
    const page = Number(pageParam) || 1;
    const pageSize = Number(pageSizeParam) || 10;
    // aplicamos filtros
    const product = url.searchParams.get('product') ?? '';
    const warehouse = url.searchParams.get('warehouse') ?? '';
    const type = url.searchParams.get('type') ?? '';

    let filtered = stockMoves;
    // Filtro por producto (texto parcial, case-insensitive)
    if (product) {
      const search = product.toLowerCase();
      filtered = filtered.filter((m) =>
        m.product.toLowerCase().includes(search),
      );
    }
    // Filtro por bodega (igualdad exacta)
    if (warehouse) {
      filtered = filtered.filter((m) => m.warehouse === warehouse);
    }
    // Filtro por tipo (igualdad exacta)
    if (type) {
      filtered = filtered.filter((m) => m.type === type);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const itemsPage = filtered.slice(start, end);
    return HttpResponse.json({
      items: itemsPage,
      total,
      page,
      pageSize,
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