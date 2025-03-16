import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CadastroDecisao from './pages/CadastroDecisao';
import AtualizarStatus from './pages/AtualizarStatus';
import RemoverEntrada from './pages/RemoverEntrada';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cadastro"
            element={
              <ProtectedRoute>
                <CadastroDecisao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atualizar-status"
            element={
              <ProtectedRoute>
                <AtualizarStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remover-entrada"
            element={
              <ProtectedRoute>
                <RemoverEntrada />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;