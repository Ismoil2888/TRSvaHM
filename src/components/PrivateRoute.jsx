import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe(); // Отписываемся от наблюдателя при размонтировании
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Вы можете заменить это на компонент загрузки
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;