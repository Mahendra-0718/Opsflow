import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({
  children,
  allowedRoles
}) {

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // Not logged in
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // Check role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    // Send user to their correct dashboard
    if (
      user.role === 'ADMIN' ||
      user.role === 'MANAGER' ||
      user.role === 'SUPER_ADMIN'
    ) {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}