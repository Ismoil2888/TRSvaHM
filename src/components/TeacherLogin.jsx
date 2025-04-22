// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getDatabase, ref as dbRef, onValue, push, set } from 'firebase/database';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import imageCompression from 'browser-image-compression';
// import '../TeacherLogin.css';
// import useTranslation from '../hooks/useTranslation';

// const TeacherLogin = () => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [login, setLogin] = useState('');
//   const [password, setPassword] = useState('');
//   const [regData, setRegData] = useState({
//     name: '', surname: '', subject: '', login: '', password: '',
//     photo: null, cathedra: '', runk: ''
//   });

//   const t = useTranslation();
//   const navigate = useNavigate();
//   const auth = getAuth();
//   const database = getDatabase();

//   const compressImage = async (file) => {
//     try {
//       return await imageCompression(file, {
//         maxSizeMB: 1,
//         maxWidthOrHeight: 1920,
//         useWebWorker: true,
//       });
//     } catch (err) {
//       console.error('Ошибка сжатия:', err);
//       return file;
//     }
//   };

//   const handleLogin = () => {
//     setError('');
//     const teachersRef = dbRef(database, 'teachers');
//     setLoading(true);

//     onValue(teachersRef, (snapshot) => {
//       const teachers = snapshot.val();
//       if (teachers) {
//         const entry = Object.entries(teachers).find(
//           ([, t]) => t.login === login && t.password === password
//         );
//         if (entry) {
//           const [teacherId, teacher] = entry;
//           navigate(`/teacher-profile/${teacherId}`, { state: { teacher: { ...teacher, id: teacherId } } });
//         } else setError('Неверный логин или пароль.');
//       } else setError('Нет зарегистрированных преподавателей.');
//       setLoading(false);
//     }, { onlyOnce: true });
//   };

//   const validateRegData = () => {
//     const required = ['name', 'surname', 'subject', 'login', 'password', 'cathedra', 'runk'];
//     for (let field of required) {
//       if (!regData[field]) return `Заполните поле: ${field}`;
//     }
//     return '';
//   };

//   const handleRegister = async () => {
//     const validationError = validateRegData();
//     if (validationError) return setError(validationError);

//     setLoading(true);
//     setError('');

//     try {
//       const { user } = await createUserWithEmailAndPassword(auth, regData.login, regData.password);
//       let teacherData = { ...regData };

//       if (teacherData.photo) {
//         const compressed = await compressImage(teacherData.photo);
//         const storage = getStorage();
//         const photoRef = storageRef(storage, `teachers/${compressed.name}`);
//         await uploadBytes(photoRef, compressed);
//         teacherData.photo = await getDownloadURL(photoRef);
//       }

//       await set(dbRef(database, `teachers/${user.uid}`), teacherData);
//       await set(dbRef(database, `users/${user.uid}`), {
//         username: `${regData.name} ${regData.surname}`,
//         avatarUrl: teacherData.photo || './default-image.png',
//         teachidentstatus: 'identified',
//         role: 'teacher',
//         email: regData.login,
//         cathedra: regData.cathedra,
//         subject: regData.subject,
//         runk: regData.runk,
//         registeredAt: new Date().toISOString()
//       });

//       const requestRef = push(dbRef(database, 'requests'));
//       await set(requestRef, {
//         senderId: user.uid,
//         receiverId: user.uid,
//         status: 'accepted',
//         pairId: `${user.uid}_${user.uid}`,
//         email: regData.login,
//         timestamp: new Date().toISOString(),
//       });

//       navigate(`/teacher-profile/${user.uid}`, { state: { teacher: teacherData } });
//     } catch (err) {
//       setError(err.message);
//       console.error('Ошибка регистрации:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="tch-login-container">
//       {isRegistering ? (
//         <>
//           <h2 style={{ color: "black" }}>Регистрация преподавателя</h2>
//           {error && <p className="error-message">{error}</p>}
//           <input
//             type="text"
//             placeholder="Имя"
//             value={regData.name}
//             onChange={(e) => setRegData({ ...regData, name: e.target.value })}
//           />
//           <input
//             type="text"
//             placeholder="Фамилия"
//             value={regData.surname}
//             onChange={(e) => setRegData({ ...regData, surname: e.target.value })}
//           />
//           <input
//             type="text"
//             placeholder="Предмет"
//             value={regData.subject}
//             onChange={(e) => setRegData({ ...regData, subject: e.target.value })}
//           />
//           {/* Выпадающий список для выбора кафедры */}
//           <select
//             value={regData.cathedra}
//             onChange={(e) => setRegData({ ...regData, cathedra: e.target.value })}
//           >
//             <option value="">Выберите кафедру</option>
//             <option value="Системахои Автоматикунонидашудаи Идоракуни">
//               Системахои Автоматикунонидашудаи Идоракуни
//             </option>
//             <option value="Шабакахои Алока Ва Системахои Комутатсиони">
//               Шабакахои Алока Ва Системахои Комутатсиони
//             </option>
//             <option value="Технологияхои Иттилооти Ва Хифзи Маълумот">
//               Технологияхои Иттилооти Ва Хифзи Маълумот
//             </option>
//             <option value="Автоматонии Равандхои Технологи Ва Истехсолот">
//               Автоматонии Равандхои Технологи Ва Истехсолот
//             </option>
//             <option value="Информатика Ва Техникаи Хисоббарор">
//               Информатика Ва Техникаи Хисоббарор
//             </option>
//           </select>
//           {/* Выпадающий список для выбора звания */}
//           <select
//             value={regData.runk}
//             onChange={(e) => setRegData({ ...regData, runk: e.target.value })}
//           >
//             <option value="">Выберите звание</option>
//             <option value="Асистент">Асистент</option>
//             <option value="Старший">Старший</option>
//             <option value="Доцент">Доцент</option>
//             <option value="Доцент2">Доцент2</option>
//             <option value="Доктор наук">Доктор наук</option>
//           </select>
//           <input
//             type="text"
//             placeholder="Логин (email)"
//             value={regData.login}
//             onChange={(e) => setRegData({ ...regData, login: e.target.value })}
//           />
//           <input
//             type="password"
//             placeholder="Пароль"
//             value={regData.password}
//             onChange={(e) => setRegData({ ...regData, password: e.target.value })}
//           />
//           <p>Ваше фото:</p>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) =>
//               setRegData({ ...regData, photo: e.target.files[0] })
//             }
//           />
//           <button onClick={handleRegister}>Зарегистрироваться</button>
//           <p className="toggle-auth">
//             Уже есть аккаунт?{" "}
//             <span onClick={() => setIsRegistering(false)} style={{ color: 'blue', cursor: 'pointer' }}>
//               Войти
//             </span>
//           </p>
//         </>
//       ) : (
//         <>
//           <h2 style={{ color: "black" }}>Вход в личный кабинет преподавателя</h2>
//           {error && <p className="error-message">{error}</p>}
//           <input
//             type="text"
//             placeholder="Логин (email)"
//             value={login}
//             onChange={(e) => setLogin(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Пароль"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button onClick={handleLogin}>Войти</button>
//           <p className="toggle-auth">
//             Нет аккаунта?{" "}
//             <span onClick={() => setIsRegistering(true)} style={{ color: 'blue', cursor: 'pointer' }}>
//               Зарегистрироваться
//             </span>
//           </p>
//         </>
//       )}
//     </div>
//   );
// };

// export default TeacherLogin;






// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getDatabase, ref as dbRef, onValue, push, set } from 'firebase/database';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import imageCompression from 'browser-image-compression';
// import '../TeacherLogin.css';
// import useTranslation from '../hooks/useTranslation';

// const TeacherLogin = () => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [login, setLogin] = useState('');
//   const [password, setPassword] = useState('');
//   const [regData, setRegData] = useState({
//     name: '', surname: '', subject: '', login: '', password: '',
//     photo: null, cathedra: '', runk: ''
//   });

//   const t = useTranslation();
//   const navigate = useNavigate();
//   const auth = getAuth();
//   const database = getDatabase();

//   const compressImage = async (file) => {
//     try {
//       return await imageCompression(file, {
//         maxSizeMB: 1,
//         maxWidthOrHeight: 1920,
//         useWebWorker: true,
//       });
//     } catch (err) {
//       console.error('Ошибка сжатия:', err);
//       return file;
//     }
//   };

//   const handleLogin = () => {
//     setError('');
//     const teachersRef = dbRef(database, 'teachers');
//     setLoading(true);

//     onValue(teachersRef, (snapshot) => {
//       const teachers = snapshot.val();
//       if (teachers) {
//         const entry = Object.entries(teachers).find(
//           ([, t]) => t.login === login && t.password === password
//         );
//         if (entry) {
//           const [teacherId, teacher] = entry;
//           navigate(`/teacher-profile/${teacherId}`, { state: { teacher: { ...teacher, id: teacherId } } });
//         } else setError('Неверный логин или пароль.');
//       } else setError('Нет зарегистрированных преподавателей.');
//       setLoading(false);
//     }, { onlyOnce: true });
//   };

//   const validateRegData = () => {
//     const required = ['name', 'surname', 'subject', 'login', 'password', 'cathedra', 'runk'];
//     for (let field of required) {
//       if (!regData[field]) return `Заполните поле: ${field}`;
//     }
//     return '';
//   };

//   const handleRegister = async () => {
//     const validationError = validateRegData();
//     if (validationError) return setError(validationError);

//     setLoading(true);
//     setError('');

//     try {
//       const { user } = await createUserWithEmailAndPassword(auth, regData.login, regData.password);
//       let teacherData = { ...regData };

//       if (teacherData.photo) {
//         const compressed = await compressImage(teacherData.photo);
//         const storage = getStorage();
//         const photoRef = storageRef(storage, `teachers/${compressed.name}`);
//         await uploadBytes(photoRef, compressed);
//         teacherData.photo = await getDownloadURL(photoRef);
//       }

//       await set(dbRef(database, `teachers/${user.uid}`), teacherData);
//       await set(dbRef(database, `users/${user.uid}`), {
//         username: `${regData.name} ${regData.surname}`,
//         avatarUrl: teacherData.photo || './default-image.png',
//         teachidentstatus: 'identified',
//         role: 'teacher',
//         email: regData.login,
//         cathedra: regData.cathedra,
//         subject: regData.subject,
//         runk: regData.runk,
//         registeredAt: new Date().toISOString()
//       });

//       const requestRef = push(dbRef(database, 'requests'));
//       await set(requestRef, {
//         senderId: user.uid,
//         receiverId: user.uid,
//         status: 'accepted',
//         pairId: `${user.uid}_${user.uid}`,
//         email: regData.login,
//         timestamp: new Date().toISOString(),
//       });

//       navigate(`/teacher-profile/${user.uid}`, { state: { teacher: teacherData } });
//     } catch (err) {
//       setError(err.message);
//       console.error('Ошибка регистрации:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="reg-teach-basic-container">
//     <div className="tch-login-container">
//       <h2>{isRegistering ? 'Регистрация преподавателя' : 'Вход в личный кабинет преподавателя'}</h2>
//       {error && <p className="error-message">{error}</p>}
//       {loading && <p className="loading-message">Загрузка...</p>}

//       {isRegistering ? (
//         <>
//           <input placeholder="Имя" value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} />
//           <input placeholder="Фамилия" value={regData.surname} onChange={e => setRegData({ ...regData, surname: e.target.value })} />
//           <input placeholder="Предмет" value={regData.subject} onChange={e => setRegData({ ...regData, subject: e.target.value })} />
//           <select value={regData.cathedra} onChange={e => setRegData({ ...regData, cathedra: e.target.value })}>
//             <option value="">Выберите кафедру</option>
//             <option value="Системахои Автоматикунонидашудаи Идоракуни">Системахои Автоматикунонидашудаи Идоракуни</option>
//             <option value="Шабакахои Алока Ва Системахои Комутатсиони">Шабакахои Алока Ва Системахои Комутатсиони</option>
//             <option value="Технологияхои Иттилооти Ва Хифзи Маълумот">Технологияхои Иттилооти Ва Хифзи Маълумот</option>
//             <option value="Автоматонии Равандхои Технологи Ва Истехсолот">Автоматонии Равандхои Технологи Ва Истехсолот</option>
//             <option value="Информатика Ва Техникаи Хисоббарор">Информатика Ва Техникаи Хисоббарор</option>
//           </select>
//           <select value={regData.runk} onChange={e => setRegData({ ...regData, runk: e.target.value })}>
//             <option value="">Выберите звание</option>
//             <option value="Ассистент">Ассистент</option>
//             <option value="Старший преподаватель">Старший преподаватель</option>
//             <option value="Кандидат технических наук">Кандидат технических наук</option>
//             <option value="Доцент">Доцент</option>
//             <option value="Доктор наук">Доктор наук</option>
//           </select>
//           <input placeholder="Email" value={regData.login} onChange={e => setRegData({ ...regData, login: e.target.value })} />
//           <input type="password" placeholder="Пароль" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} />
//           <p className="txt">Ваше фото:</p>
//           <input type="file" accept="image/*" onChange={e => setRegData({ ...regData, photo: e.target.files[0] })} />
//           <button onClick={handleRegister} disabled={loading}>Зарегистрироваться</button>
//           <p className="toggle-auth txt">Уже есть аккаунт? <span onClick={() => setIsRegistering(false)} style={{ color: '#00e5ff', cursor: 'pointer' }}>Войти</span></p>
//         </>
//       ) : (
//         <>
//           <input placeholder="Email" value={login} onChange={e => setLogin(e.target.value)} />
//           <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
//           <button onClick={handleLogin} disabled={loading}>Войти</button>
//           <p className="toggle-auth txt">Нет аккаунта? <span onClick={() => setIsRegistering(true)} style={{ color: '#00e5ff', cursor: 'pointer' }}>Зарегистрироваться</span></p>
//         </>
//       )}
//     </div>
//     </div>
//   );
// };

// export default TeacherLogin;














import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref as dbRef, push, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import imageCompression from 'browser-image-compression';
import '../TeacherLogin.css';
import useTranslation from '../hooks/useTranslation';

const TeacherLogin = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({
    name: '', subject: '', login: '', password: '',
    photo: null, cathedra: '', runk: ''
  });

  const t = useTranslation();
  const navigate = useNavigate();
  const auth = getAuth();
  const database = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home", { replace: true });
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, login, password);
      const user = userCredential.user;

      const snapshot = await get(dbRef(database, `teachers/${user.uid}`));
      const teacherData = snapshot.val();

      if (!teacherData) {
        setError('Профиль преподавателя не найден.');
        setLoading(false);
        return;
      }

      navigate(`/myprofile`, {
        state: { teacher: { ...teacherData, id: user.uid } },
      });
    } catch (err) {
      console.error(err);
      setError('Неверный логин или пароль.');
    } finally {
      setLoading(false);
    }
  };

  const validateRegData = () => {
    const required = ['name', 'subject', 'login', 'password', 'cathedra', 'runk'];
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
      let teacherData = { ...regData };
      delete teacherData.password; // ✅ удаляем перед сохранением в БД

      if (teacherData.photo) {
        const compressed = await compressImage(teacherData.photo);
        const storage = getStorage();
        const photoRef = storageRef(storage, `teachers/${compressed.name}`);
        await uploadBytes(photoRef, compressed);
        teacherData.photo = await getDownloadURL(photoRef);
      }

      await set(dbRef(database, `teachers/${user.uid}`), teacherData);
      await set(dbRef(database, `users/${user.uid}`), {
        username: regData.name,
        avatarUrl: teacherData.photo || './default-image.png',
        teachidentstatus: 'identified',
        role: 'teacher',
        email: regData.login,
        cathedra: regData.cathedra,
        subject: regData.subject,
        runk: regData.runk,
        registeredAt: new Date().toISOString()
      });

      const requestRef = push(dbRef(database, 'requests'));
      await set(requestRef, {
        senderId: user.uid,
        receiverId: user.uid,
        status: 'accepted',
        pairId: `${user.uid}_${user.uid}`,
        email: regData.login,
        timestamp: new Date().toISOString(),
      });

      navigate(`/teacher-profile/${user.uid}`, { state: { teacher: teacherData } });
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
        <h2>{isRegistering ? 'Регистрация преподавателя' : 'Вход в личный кабинет преподавателя'}</h2>
        {error && <p className="error-message">{error}</p>}
        {loading && <p className="loading-message">Загрузка...</p>}

        {isRegistering ? (
          <>
            <input placeholder="ФИО" value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} />
            <input placeholder="Предметы" value={regData.subject} onChange={e => setRegData({ ...regData, subject: e.target.value })} />
            <select value={regData.cathedra} onChange={e => setRegData({ ...regData, cathedra: e.target.value })}>
              <option value="">Выберите кафедру</option>
              <option value="Системахои Автоматикунонидашудаи Идоракуни">Системахои Автоматикунонидашудаи Идоракуни</option>
              <option value="Шабакахои Алока Ва Системахои Комутатсиони">Шабакахои Алока Ва Системахои Комутатсиони</option>
              <option value="Технологияхои Иттилооти Ва Хифзи Маълумот">Технологияхои Иттилооти Ва Хифзи Маълумот</option>
              <option value="Автоматонии Равандхои Технологи Ва Истехсолот">Автоматонии Равандхои Технологи Ва Истехсолот</option>
              <option value="Информатика Ва Техникаи Хисоббарор">Информатика Ва Техникаи Хисоббарор</option>
            </select>
            <select value={regData.runk} onChange={e => setRegData({ ...regData, runk: e.target.value })}>
              <option value="">Выберите звание</option>
              <option value="Ассистент">Ассистент</option>
              <option value="Старший преподаватель">Старший преподаватель</option>
              <option value="Кандидат технических наук">Кандидат технических наук</option>
              <option value="Доцент">Доцент</option>
              <option value="Доктор наук">Доктор наук</option>
            </select>
            <input placeholder="Email" value={regData.login} onChange={e => setRegData({ ...regData, login: e.target.value })} />
            <input type="password" placeholder="Пароль" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} />
            <p className="txt">Ваше фото:</p>
            <input type="file" accept="image/*" onChange={e => setRegData({ ...regData, photo: e.target.files[0] })} />
            <button onClick={handleRegister} disabled={loading}>Зарегистрироваться</button>
            <p className="toggle-auth txt">Уже есть аккаунт? <span onClick={() => setIsRegistering(false)} style={{ color: '#00e5ff', cursor: 'pointer' }}>Войти</span></p>
          </>
        ) : (
          <>
            <input placeholder="Email" value={login} onChange={e => setLogin(e.target.value)} />
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin} disabled={loading}>Войти</button>
            <p className="toggle-auth txt">Нет аккаунта? <span onClick={() => setIsRegistering(true)} style={{ color: '#00e5ff', cursor: 'pointer' }}>Зарегистрироваться</span></p>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherLogin;