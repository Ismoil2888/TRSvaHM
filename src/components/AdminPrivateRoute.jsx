import React from "react";
import { Navigate } from "react-router-dom";

const AdminPrivateRoute = ({ children }) => {
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  const loginTime = localStorage.getItem('adminLoginTime');
  
  // Проверяем, если прошло более 1 часа (3600000 миллисекунд)
  const oneHourInMillis = 60 * 60 * 1000;

  if (isAdminAuthenticated && loginTime) {
    const currentTime = Date.now();
    const timePassed = currentTime - loginTime;

    if (timePassed > oneHourInMillis) {
      // Если прошло более 1 часа, удаляем авторизацию
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('adminLoginTime');
      return <Navigate to="/987654321kulobjon987654321" />;
    }
  } else {
    return <Navigate to="/987654321kulobjon987654321" />;
  }

  return children;
};

export default AdminPrivateRoute;