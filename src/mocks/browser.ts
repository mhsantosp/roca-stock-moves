/**
 * Configuración del Service Worker de MSW (Mock Service Worker) en entorno navegador.
 *
 * - setupWorker crea un Service Worker que intercepta las peticiones HTTP
 *   realizadas por la aplicación (fetch/XHR).
 * - handlers es la colección de endpoints mock definidos en handlers.ts.
 * - El worker se arranca condicionalmente en main.tsx solo en modo desarrollo,
 *   de forma que en producción la app pueda hablar con un backend real.
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Creamos el worker de MSW con todos los handlers definidos. Este objeto se
// importa en main.tsx para llamar a worker.start() cuando sea necesario.
export const worker = setupWorker(...handlers);