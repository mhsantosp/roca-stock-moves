/**
 * Configuración principal de Vite para la aplicación.
 *
 * - plugins: se habilita @vitejs/plugin-react para soportar JSX/TSX y Fast Refresh.
 * - test: configuración de Vitest para ejecutar los tests de frontend en un
 *   entorno de navegador simulado (jsdom) y cargar configuración común desde
 *   src/setupTests.ts.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Ejecuta los tests en un entorno similar al navegador donde existe
    // window, document, etc., necesario para React Testing Library.
    environment: 'jsdom',
    // Archivo de configuración de tests donde se registran matchers extra
    // (por ejemplo, @testing-library/jest-dom/vitest).
    setupFiles: ['./src/setupTests.ts'],
  },
})
