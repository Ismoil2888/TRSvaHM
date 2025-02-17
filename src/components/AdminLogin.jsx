import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import "../AdminLogin.css";

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === 'admin2025') {
      // Сохраняем флаг авторизации и время входа
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminLoginTime', Date.now()); // Сохраняем текущее время

      setShowWelcome(true);
      setTimeout(() => {
        navigate('/admin'); // Перенаправление в административную панель
      }, 2000);
    } else {
      setError('Неверный пароль');
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