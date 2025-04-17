// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export function RoleRoute({ allowedRoles = [], children }) {
  // допустим, вы храните роль в локалстораже
  const role = localStorage.getItem('userRole');

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }
  return children;
}