// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getDatabase, ref as dbRef, onValue, push, set } from 'firebase/database';
// import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from 'firebase/storage';
// import "../TeacherLogin.css";

// const TeacherLogin = () => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [error, setError] = useState('');

//   // Состояния для входа
//   const [login, setLogin] = useState('');
//   const [password, setPassword] = useState('');

//   // Состояния для регистрации
//   const [regData, setRegData] = useState({
//     name: '',
//     surname: '',
//     subject: '',
//     login: '',
//     password: '',
//     photo: null, // опционально, можно загрузить фото преподавателя
//   });

//   const navigate = useNavigate();

//   // Функция входа
//   const handleLogin = () => {
//     setError('');
//     const database = getDatabase();
//     const teachersRef = dbRef(database, 'teachers');

//     onValue(
//       teachersRef,
//       (snapshot) => {
//         const teachersData = snapshot.val();
//         if (teachersData) {
//           // Ищем преподавателя по логину и паролю (используем Object.entries, чтобы получить ключ как id)
//           const found = Object.entries(teachersData).find(
//             ([key, teacher]) => teacher.login === login && teacher.password === password
//           );

//           if (found) {
//             const [teacherId, teacher] = found;
//             teacher.id = teacherId;
//             // При успешном входе переходим в личный кабинет преподавателя
//             navigate(`/teacher-profile/${teacherId}`, { state: { teacher } });
//           } else {
//             setError('Неверный логин или пароль.');
//           }
//         } else {
//           setError('Нет зарегистрированных преподавателей.');
//         }
//       },
//       { onlyOnce: true }
//     );
//   };

//   // Функция регистрации (с возможностью загрузки фото)
//   const handleRegister = async () => {
//     setError('');
//     // Проверяем, что все поля заполнены
//     if (!regData.name || !regData.surname || !regData.subject || !regData.login || !regData.password) {
//       setError('Пожалуйста, заполните все поля для регистрации.');
//       return;
//     }

//     const database = getDatabase();
//     const teachersRef = dbRef(database, 'teachers');
//     const newTeacherRef = push(teachersRef);
//     let teacherData = { ...regData };

//     // Если выбрано фото, загружаем его в Firebase Storage
//     if (regData.photo) {
//       const storage = getStorage();
//       const photoRef = storageReference(storage, `teachers/${regData.photo.name}`);
//       try {
//         const snapshot = await uploadBytes(photoRef, regData.photo);
//         const url = await getDownloadURL(snapshot.ref);
//         teacherData.photo = url;
//       } catch (err) {
//         console.error('Ошибка загрузки фото:', err);
//         setError('Ошибка загрузки фото.');
//         return;
//       }
//     }

//     try {
//       await set(newTeacherRef, teacherData);
//       teacherData.id = newTeacherRef.key;
//       // После регистрации сразу перенаправляем в личный кабинет
//       navigate(`/teacher-profile/${newTeacherRef.key}`, { state: { teacher: teacherData } });
//     } catch (err) {
//       console.error('Ошибка регистрации:', err);
//       setError('Ошибка регистрации.');
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
//           <input
//             type="text"
//             placeholder="Логин"
//             value={regData.login}
//             onChange={(e) => setRegData({ ...regData, login: e.target.value })}
//           />
//           <input
//             type="password"
//             placeholder="Пароль"
//             value={regData.password}
//             onChange={(e) => setRegData({ ...regData, password: e.target.value })}
//           />
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
//             placeholder="Логин"
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







import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref as dbRef, onValue, push, set } from 'firebase/database';
import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import "../TeacherLogin.css";

const TeacherLogin = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // Состояния для входа
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  // Состояния для регистрации
  const [regData, setRegData] = useState({
    name: '',
    surname: '',
    subject: '',
    login: '',
    password: '',
    photo: null, // опционально, можно загрузить фото преподавателя
    cathedra: '', // новое поле "Кафедра"
    status: '',   // новое поле "Статус"
  });

  const navigate = useNavigate();

  // Функция для сжатия изображения
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.log("Ошибка при сжатии изображения:", error);
      return file;
    }
  };

  // Функция входа
  const handleLogin = () => {
    setError('');
    const database = getDatabase();
    const teachersRef = dbRef(database, 'teachers');

    onValue(
      teachersRef,
      (snapshot) => {
        const teachersData = snapshot.val();
        if (teachersData) {
          // Ищем преподавателя по логину и паролю (используем Object.entries для получения ключа как id)
          const found = Object.entries(teachersData).find(
            ([key, teacher]) => teacher.login === login && teacher.password === password
          );

          if (found) {
            const [teacherId, teacher] = found;
            teacher.id = teacherId;
            // При успешном входе переходим в личный кабинет преподавателя
            navigate(`/teacher-profile/${teacherId}`, { state: { teacher } });
          } else {
            setError('Неверный логин или пароль.');
          }
        } else {
          setError('Нет зарегистрированных преподавателей.');
        }
      },
      { onlyOnce: true }
    );
  };

  // Функция регистрации (с возможностью загрузки фото)
  const handleRegister = async () => {
    setError('');
    // Проверяем, что все поля заполнены
    if (
      !regData.name ||
      !regData.surname ||
      !regData.subject ||
      !regData.login ||
      !regData.password ||
      !regData.cathedra ||
      !regData.status
    ) {
      setError('Пожалуйста, заполните все поля для регистрации.');
      return;
    }

    const database = getDatabase();
    const teachersRef = dbRef(database, 'teachers');
    const newTeacherRef = push(teachersRef);
    let teacherData = { ...regData };

    // Если выбрано фото, сначала сжимаем и загружаем его в Firebase Storage
    if (regData.photo) {
      const storage = getStorage();
      try {
        const compressedPhoto = await compressImage(regData.photo);
        const photoRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
        await uploadBytes(photoRef, compressedPhoto);
        const url = await getDownloadURL(photoRef);
        teacherData.photo = url;
      } catch (err) {
        console.error('Ошибка загрузки фото:', err);
        setError('Ошибка загрузки фото.');
        return;
      }
    }

    try {
      await set(newTeacherRef, teacherData);
      teacherData.id = newTeacherRef.key;
      // После регистрации сразу перенаправляем в личный кабинет
      navigate(`/teacher-profile/${newTeacherRef.key}`, { state: { teacher: teacherData } });
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError('Ошибка регистрации.');
    }
  };

  return (
    <div className="tch-login-container">
      {isRegistering ? (
        <>
          <h2 style={{ color: "black" }}>Регистрация преподавателя</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            placeholder="Имя"
            value={regData.name}
            onChange={(e) => setRegData({ ...regData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={regData.surname}
            onChange={(e) => setRegData({ ...regData, surname: e.target.value })}
          />
          <input
            type="text"
            placeholder="Предмет"
            value={regData.subject}
            onChange={(e) => setRegData({ ...regData, subject: e.target.value })}
          />
          {/* Новое поле "Кафедра" с выбором из списка */}
          <select
            value={regData.cathedra}
            onChange={(e) => setRegData({ ...regData, cathedra: e.target.value })}
          >
            <option value="">Выберите кафедру</option>
            <option value="Системахои Автоматикунонидашудаи Идоракуни">
              Системахои Автоматикунонидашудаи Идоракуни
            </option>
            <option value="Шабакахои Алока Ва Системахои Комутатсиони">
              Шабакахои Алока Ва Системахои Комутатсиони
            </option>
            <option value="Технологияхои Иттилооти Ва Хифзи Маълумот">
              Технологияхои Иттилооти Ва Хифзи Маълумот
            </option>
            <option value="Автоматонии Равандхои Технологи Ва Истехсолот">
              Автоматонии Равандхои Технологи Ва Истехсолот
            </option>
            <option value="Информатика Ва Техникаи Хисоббарор">
              Информатика Ва Техникаи Хисоббарор
            </option>
          </select>
          {/* Новое поле "Статус" с выбором из списка */}
          <select
            value={regData.status}
            onChange={(e) => setRegData({ ...regData, status: e.target.value })}
          >
            <option value="">Выберите статус</option>
            <option value="Асистент">Асистент</option>
            <option value="Старший">Старший</option>
            <option value="Доцент">Доцент</option>
            <option value="Доцент2">Доцент2</option>
            <option value="Доктор наук">Доктор наук</option>
          </select>
          <input
            type="text"
            placeholder="Логин"
            value={regData.login}
            onChange={(e) => setRegData({ ...regData, login: e.target.value })}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={regData.password}
            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setRegData({ ...regData, photo: e.target.files[0] })
            }
          />
          <button onClick={handleRegister}>Зарегистрироваться</button>
          <p className="toggle-auth">
            Уже есть аккаунт?{" "}
            <span onClick={() => setIsRegistering(false)} style={{ color: 'blue', cursor: 'pointer' }}>
              Войти
            </span>
          </p>
        </>
      ) : (
        <>
          <h2 style={{ color: "black" }}>Вход в личный кабинет преподавателя</h2>
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
          <p className="toggle-auth">
            Нет аккаунта?{" "}
            <span onClick={() => setIsRegistering(true)} style={{ color: 'blue', cursor: 'pointer' }}>
              Зарегистрироваться
            </span>
          </p>
        </>
      )}
    </div>
  );
};

export default TeacherLogin;