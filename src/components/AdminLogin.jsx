import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import "../AdminLogin.css";

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem("isAdminAuthenticated", "true");
        localStorage.setItem("adminLoginTime", Date.now()); // ✅ добавь это
        setShowWelcome(true);
        setTimeout(() => navigate('/987654321admin987654321'), 2000);      
      } else {
        setError(data.error || "Ошибка входа");
      }
    } catch (err) {
      setError("Ошибка сервера");
    }
  };  

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: 'spring' } },
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="login-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1>Вход в административную панель</h1>
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <motion.p className="error-message">{error}</motion.p>}
        <button onClick={handleLogin}>Войти</button>
      </motion.div>

      {showWelcome && (
        <motion.div
          className="welcome-popup"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>Добро пожаловать, Администратор!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminLogin;