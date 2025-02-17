import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
import "../TeacherLogin.css"

const TeacherLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const database = getDatabase();
    const teachersRef = dbRef(database, 'teachers');

    onValue(teachersRef, (snapshot) => {
      const teachersData = snapshot.val();

      if (teachersData) {
        const teacher = Object.values(teachersData).find(
          (t) => t.login === login && t.password === password
        );

        if (teacher) {
          // Если логин и пароль верны, перенаправляем на страницу профиля преподавателя
          navigate(`/teacher-profile/${teacher.id}`, { state: { teacher } });
        } else {
          setError('Неверный логин или пароль.');
        }
      }
    });
  };

  return (
    <div className="tch-login-container">
      <h2 style={{color: "black"}}>Вход в личный кабинет преподавателя</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Логин"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
};

export default TeacherLogin;