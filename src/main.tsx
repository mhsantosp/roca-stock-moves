/**
 * Punto de entrada de la aplicación React.
 *
 * Aquí se ensamblan todos los providers de alto nivel:
 * - React Query: capa de manejo de datos remotos (cache, refetch, mutations).
 * - AuthProvider: contexto de autenticación y persistencia de token.
 * - BrowserRouter: enrutamiento SPA con react-router-dom.
 *
 * Además, en modo desarrollo se inicializa MSW (Mock Service Worker) para
 * simular una API real sin necesitar un backend.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Instancia compartida de QueryClient para toda la aplicación.
// Esta instancia mantiene la cache de React Query y permite compartir datos
// entre componentes (por ejemplo, entre el listado y el detalle).
const queryClient = new QueryClient();

// Inicializa el worker de MSW SOLO en desarrollo.
// Esto permite interceptar las peticiones HTTP (fetch) y responder con
// datos mock definidos en src/mocks/handlers.ts, simulando una API real.
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}

// Render raíz de la SPA. Se encadenan los providers de fuera hacia dentro
// dejando a <App /> lo más “limpio” posible de infraestructura.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
