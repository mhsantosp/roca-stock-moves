import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Importa el worker SOLO si estamos en desarrollo
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
