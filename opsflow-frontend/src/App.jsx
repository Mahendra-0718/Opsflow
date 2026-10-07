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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Employee Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin / Manager / Super Admin Dashboard */}
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

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;