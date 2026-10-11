import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Unified Employee / User Portal (Accessible to all authenticated members) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MANAGER', 'SUPER_ADMIN', 'AUDITOR']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin / Manager Command Center (Restricted to privileged operational roles) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={['ADMIN', 'MANAGER', 'SUPER_ADMIN']}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;