import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Creamos el worker de MSW con todos los handlers definidos
export const worker = setupWorker(...handlers);