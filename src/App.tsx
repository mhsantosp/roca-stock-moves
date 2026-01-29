import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { LoginPage } from './pages/LoginPage'
import { StockMovesListPage } from './pages/StockMovesListPage'
import { StockMoveDetailPage } from './pages/StockMoveDetailPage'
import { PrivateRoute } from './auth/PrivateRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/stock-moves"
        element={
          <PrivateRoute>
            <StockMovesListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/stock-moves/:id"
        element={
          <PrivateRoute>
            <StockMoveDetailPage />
          </PrivateRoute>
        }
      />
      {/* Redirección por defecto a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
