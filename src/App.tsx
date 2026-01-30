/**
 * Componente raíz de enrutamiento de la aplicación.
 *
 * Su responsabilidad es únicamente declarar las rutas de la SPA y decidir
 * qué página se renderiza para cada path.
 *
 * Notas importantes:
 * - /login es la única ruta pública (no requiere autenticación).
 * - /stock-moves y /stock-moves/:id están protegidas por <PrivateRoute>,
 *   lo que significa que solo son accesibles si existe un token en el
 *   contexto de autenticación.
 * - La ruta comodín (*) redirige siempre a /login como comportamiento por
 *   defecto ante URLs desconocidas.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { LoginPage } from './pages/LoginPage'
import { StockMovesListPage } from './pages/StockMovesListPage'
import { StockMoveDetailPage } from './pages/StockMoveDetailPage'
import { PrivateRoute } from './auth/PrivateRoute'

function App() {
  return (
    <Routes>
      {/* Ruta pública para autenticación */}
      <Route path="/login" element={<LoginPage />} />

      {/* Ruta protegida que muestra el listado de movimientos */}
      <Route
        path="/stock-moves"
        element={
          <PrivateRoute>
            <StockMovesListPage />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida que muestra el detalle de un movimiento concreto */}
      <Route
        path="/stock-moves/:id"
        element={
          <PrivateRoute>
            <StockMoveDetailPage />
          </PrivateRoute>
        }
      />

      {/* Redirección por defecto a /login para cualquier ruta no reconocida */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
