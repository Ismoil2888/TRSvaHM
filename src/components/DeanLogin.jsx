import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref as dbRef, onValue, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import imageCompression from 'browser-image-compression';
import '../TeacherLogin.css';
import useTranslation from '../hooks/useTranslation';

const DeanLogin = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  // Для декана нам не нужны поля "cathedra" и "runk"
  const [regData, setRegData] = useState({
    name: '',
    surname: '',
    subject: '',
    login: '',
    password: '',
    photo: null,
  });

  const t = useTranslation();
  const navigate = useNavigate();
  const auth = getAuth();
  const database = getDatabase();

  const compressImage = async (file) => {
    try {
      return await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
    } catch (err) {
      console.error('Ошибка сжатия:', err);
      return file;
    }
  };

  const handleLogin = () => {
    setError('');
    const teachersRef = dbRef(database, 'teachers');
    setLoading(true);

    onValue(teachersRef, (snapshot) => {
      const teachers = snapshot.val();
      if (teachers) {
        const entry = Object.entries(teachers).find(
          ([, t]) => t.login === login && t.password === password
        );
        if (entry) {
          const [deanId, dean] = entry;
          navigate(`/teacher-profile/${deanId}`, { state: { teacher: { ...dean, id: deanId } } });
        } else {
          setError('Неверный логин или пароль.');
        }
      } else {
        setError('Нет зарегистрированных деканов.');
      }
      setLoading(false);
    }, { onlyOnce: true });
  };

  const validateRegData = () => {
    // Для декана требуются только основные поля
    const required = ['name', 'surname', 'subject', 'login', 'password'];
    for (let field of required) {
      if (!regData[field]) return `Заполните поле: ${field}`;
    }
    return '';
  };

  const handleRegister = async () => {
    const validationError = validateRegData();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError('');

    try {
      const { user } = await createUserWithEmailAndPassword(auth, regData.login, regData.password);
      let deanData = { ...regData };

      if (deanData.photo) {
        const compressed = await compressImage(deanData.photo);
        const storage = getStorage();
        const photoRef = storageRef(storage, `teachers/${compressed.name}`);
        await uploadBytes(photoRef, compressed);
        deanData.photo = await getDownloadURL(photoRef);
      }

      // Сохраняем данные в узле teachers
      await set(dbRef(database, `teachers/${user.uid}`), deanData);
      // Записываем данные пользователя с ролью "dean" и добавляем его во все кафедры
      await set(dbRef(database, `users/${user.uid}`), {
        username: `${regData.name} ${regData.surname}`,
        avatarUrl: deanData.photo || './default-image.png',
        role: 'dean',
        email: regData.login,
        subject: regData.subject,
        cathedra: [
          "Системахои Автоматикунонидашудаи Идоракуни",
          "Шабакахои Алока Ва Системахои Комутатсиони",
          "Технологияхои Иттилооти Ва Хифзи Маълумот",
          "Автоматонии Равандхои Технологи Ва Истехсолот",
          "Информатика Ва Техникаи Хисоббарор"
        ],
        isDean: true, // новое поле
        registeredAt: new Date().toISOString()
      });      

      // Создаем запись-заявку (при необходимости)
      const requestRef = push(dbRef(database, 'requests'));
      await set(requestRef, {
        senderId: user.uid,
        receiverId: user.uid,
        status: 'accepted',
        pairId: `${user.uid}_${user.uid}`,
        email: regData.login,
        timestamp: new Date().toISOString(),
      });

      // Перенаправляем на страницу профиля (в карточке вместо "Звание:" можно выводить "Должность: Декан")
      navigate(`/teacher-profile/${user.uid}`, { state: { teacher: deanData } });
    } catch (err) {
      setError(err.message);
      console.error('Ошибка регистрации:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-teach-basic-container">
      <div className="tch-login-container">
        <h2>{isRegistering ? 'Регистрация декана' : 'Вход в личный кабинет декана'}</h2>
        {error && <p className="error-message">{error}</p>}
        {loading && <p className="loading-message">Загрузка...</p>}

        {isRegistering ? (
          <>
            <input
              placeholder="Имя"
              value={regData.name}
              onChange={e => setRegData({ ...regData, name: e.target.value })}
            />
            <input
              placeholder="Фамилия"
              value={regData.surname}
              onChange={e => setRegData({ ...regData, surname: e.target.value })}
            />
            <input
              placeholder="Предмет"
              value={regData.subject}
              onChange={e => setRegData({ ...regData, subject: e.target.value })}
            />
            <input
              placeholder="Email"
              value={regData.login}
              onChange={e => setRegData({ ...regData, login: e.target.value })}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={regData.password}
              onChange={e => setRegData({ ...regData, password: e.target.value })}
            />
            <p>Ваше фото:</p>
            <input
              type="file"
              accept="image/*"
              onChange={e => setRegData({ ...regData, photo: e.target.files[0] })}
            />
            <button onClick={handleRegister} disabled={loading}>Зарегистрироваться</button>
            <p className="toggle-auth">
              Уже есть аккаунт? <span onClick={() => setIsRegistering(false)} style={{ color: '#00e5ff', cursor: 'pointer' }}>Войти</span>
            </p>
          </>
        ) : (
          <>
            <input
              placeholder="Email"
              value={login}
              onChange={e => setLogin(e.target.value)}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} disabled={loading}>Войти</button>
            <p className="toggle-auth">
              Нет аккаунта? <span onClick={() => setIsRegistering(true)} style={{ color: '#00e5ff', cursor: 'pointer' }}>Зарегистрироваться</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DeanLogin;