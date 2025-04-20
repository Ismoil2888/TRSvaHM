import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as dbRef, set, update, get } from "firebase/database";
import { auth, database } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../SignUp-SignIn.css";
import { FaArrowLeft } from "react-icons/fa";
import { IoPersonOutline, IoMailOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import forbiddenNames from "./forbiddenNames";


// —————— helper-функция для получения и сохранения IP ——————
async function fetchAndSaveIp(uid) {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    const ip = res.data.ip;
    await update(dbRef(database, `users/${uid}`), { ipAddress: ip });
  } catch (e) {
    console.error("Не удалось получить или сохранить IP:", e);
  }
}


const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCopyPassword, setShowCopyPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // на монтировании проверяем: не заблокирован ли мой IP?
  useEffect(() => {
    let isMounted = true;
    axios.get('https://api.ipify.org?format=json')
      .then(({ data }) => data.ip)
      .then(ip => {
        if (!isMounted) return;
        return get(dbRef(database, `blockedIPs/${ip}`))
          .then(snap => ({ ip, blocked: snap.exists() }));
      })
      .then(({ ip, blocked }) => {
        if (blocked) {
          alert(`Ваш IP ${ip} заблокирован. Обратитесь в поддержку.`);
          auth.signOut();
          navigate('/blocked', { replace: true });
        }
      })
      .catch(() => {
        // если не удалось получить IP или проверить — молча продолжаем
      });
    return () => { isMounted = false; };
  }, [navigate]);

  // если уже залогинен — сразу на home
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) navigate("/home", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const togglePasswordVisibility = () => setShowPassword(p => !p);
  const toggleCopyPasswordVisibility = () => setShowCopyPassword(p => !p);

  const register = async e => {
    e.preventDefault();
    if (forbiddenNames.includes(username.toLowerCase())) {
      setError("Это имя запрещено, используйте другое"); return;
    }
    if (password !== copyPassword) {
      setError("Пароли не совпадают"); return;
    }
    setIsLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // создаём профиль
      await set(dbRef(database, `users/${user.uid}`), {
        username,
        email: user.email,
      });
      // сохраняем IP
      await fetchAndSaveIp(user.uid);
      // сброс и редирект
      setUsername(""); setEmail(""); setPassword(""); setCopyPassword(""); setError("");
      window.location.href = "#/home";
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use': setError("Этот имейл уже используется"); break;
        case 'auth/invalid-email':          setError("Неверный формат email");        break;
        case 'auth/weak-password':          setError("Пароль слишком слабый");        break;
        default:                            setError("Произошла ошибка при регистрации");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section">
      <Link className="back-button white-icon" style={{ position: "absolute", top:0, left:20 }} onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </Link>
      <div className="register-box">
        <form onSubmit={register}>
          <h2>Регистрация</h2>

          <div className="reg-input-box">
            <span className="icon"><IoPersonOutline/></span>
            <input
              type="text" maxLength="12"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required />
            <label>Имя</label>
          </div>

          <div className="reg-input-box">
            <span className="icon"><IoMailOutline/></span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required />
            <label>Электронная почта</label>
          </div>

          <div className="reg-input-box">
            <span className="icon" onClick={togglePasswordVisibility} style={{cursor:'pointer'}}>
              {showPassword ? <IoEyeOutline/> : <IoEyeOffOutline/>}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength="6"
              required />
            <label>Пароль</label>
          </div>

          <div className="reg-input-box">
            <span className="icon" onClick={toggleCopyPasswordVisibility} style={{cursor:'pointer'}}>
              {showCopyPassword ? <IoEyeOutline/> : <IoEyeOffOutline/>}
            </span>
            <input
              type={showCopyPassword ? "text" : "password"}
              value={copyPassword}
              onChange={e => setCopyPassword(e.target.value)}
              minLength="6"
              required />
            <label>Подтвердите пароль</label>
          </div>

          <div className="remember-forgot"><p>Забыли пароль?</p></div>

          <button className="reg-login-button" type="submit" disabled={isLoading}>
            {isLoading ? <span className="reg-spinner"/> : "Зарегистрироваться"}
          </button>

          {error && <p style={{ color:"red", marginTop:75, position:"absolute", marginLeft:50 }}>{error}</p>}

          <div className="register-link">
            <p>Уже есть аккаунт? <Link to="/signin">Войти</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;








// import React, { useState, useEffect } from "react";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { onAuthStateChanged } from "firebase/auth";
// import { ref, set } from "firebase/database";
// import { getDatabase, ref as dbRef, get } from "firebase/database"
// import { auth, database } from "../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import "../SignUp-SignIn.css";
// import { FaArrowLeft } from "react-icons/fa";
// import { IoPersonOutline, IoMailOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
// import forbiddenNames from "./forbiddenNames"; // Импорт списка запрещённых имён
// import axios from 'axios'

// const SignUp = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [copyPassword, setCopyPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showCopyPassword, setShowCopyPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false); // Состояние для спиннера
//   const navigate = useNavigate();

//   useEffect(() => {
//     // 1) Получаем свой IP
//     axios.get('https://api.ipify.org?format=json')
//       .then(({ data }) => data.ip)
//       .then(ip => {
//         const db = getDatabase()
//         // 2) Проверяем его в blockedIPs/{ip}
//         return get(dbRef(db, `blockedIPs/${ip}`)).then(snap => ({ ip, blocked: snap.exists() }))
//       })
//       .then(({ ip, blocked }) => {
//         if (blocked) {
//           alert(`Ваш IP ${ip} заблокирован. Обратитесь в поддержку.`)
//           auth.signOut()      // сбрасываем любую аутентификацию
//           navigate('/blocked') // или просто навигируем на '/'
//         }
//       })
//       .catch(() => {
//         // молча продолжаем, если не удалось получить IP или проверить в БД
//       })
//   }, [])

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         navigate("/home", { replace: true });
//       }
//     });
  
//     return () => unsubscribe();
//   }, []);  

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const toggleCopyPasswordVisibility = () => {
//     setShowCopyPassword(!showCopyPassword);
//   };

//   const register = (e) => {
//     e.preventDefault();

//     // Проверяем, если имя пользователя входит в список запрещённых
//     if (forbiddenNames.includes(username.toLowerCase())) {
//       setError("Это имя запрещено, используйте другое");
//       return;
//     }

//     if (copyPassword !== password) {
//       setError("Пароли не совпадают");
//       return;
//     }

//     setIsLoading(true); // Включаем спиннер

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;

//         set(ref(database, "users/" + user.uid), {
//           username: username,
//           email: user.email,
//         });

//         // Сбрасываем состояния
//         setError("");
//         setEmail("");
//         setPassword("");
//         setCopyPassword("");
//         setUsername("");
//         setIsLoading(false);
//         window.location.href = "#/home";
//       })
//       .catch((error) => {
//         setIsLoading(false);
//         switch (error.code) {
//           case 'auth/email-already-in-use':
//             setError("Этот имейл уже используется");
//             break;
//           case 'auth/invalid-email':
//             setError("Неверный формат email");
//             break;
//           case 'auth/weak-password':
//             setError("Пароль слишком слабый");
//             break;
//           default:
//             setError("Произошла ошибка при регистрации");
//         }
//       });
//   };

//   return (
//     <div className="section">
//       <Link className="back-button white-icon" style={{ position: "absolute", top: "0", left: "20px" }} onClick={() => navigate(-1)}>
//         <FaArrowLeft />
//       </Link>
//       <div className="register-box">
//         <form onSubmit={register}>
//           <h2>Регистрация</h2>
//           <div className="reg-input-box">
//             <span className="icon">
//               <IoPersonOutline />
//             </span>
//             <input
//               type="text"
//               maxLength="12"
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//             <label htmlFor="username">Имя</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon">
//               <IoMailOutline />
//             </span>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <label htmlFor="email">Электронная почта</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
//               {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
//             </span>
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               minLength="6"
//               required
//             />
//             <label htmlFor="password">Пароль</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon" onClick={toggleCopyPasswordVisibility} style={{ cursor: "pointer" }}>
//               {showCopyPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
//             </span>
//             <input
//               type={showCopyPassword ? "text" : "password"}
//               id="confirmPassword"
//               value={copyPassword}
//               onChange={(e) => setCopyPassword(e.target.value)}
//               minLength="6"
//               required
//             />
//             <label htmlFor="confirmPassword">Подтвердите пароль</label>
//           </div>
//           <div className="remember-forgot">
//             <p>Забыли пароль?</p>
//           </div>
//           <button className="reg-login-button" type="submit" disabled={isLoading}>
//             {isLoading ? (
//               // Пример простого спиннера через CSS
//               <span className="reg-spinner"></span>
//             ) : (
//               "Зарегистрироваться"
//             )}
//           </button>
//           {error && <p style={{ color: "red", marginTop: "75px", position: "absolute", marginLeft: "50px" }}>{error}</p>}
//           <div className="register-link">
//             <p>
//               Уже есть аккаунт? <Link className="a" to="/signin">Войти</Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignUp;











// import React, { useState } from "react";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { ref, set } from "firebase/database";
// import { auth, database } from "../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import "../SignUp-SignIn.css";
// import { FaArrowLeft } from "react-icons/fa";
// import { IoPersonOutline, IoMailOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

// const SignUp = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [copyPassword, setCopyPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showCopyPassword, setShowCopyPassword] = useState(false);
//   const navigate = useNavigate();

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const toggleCopyPasswordVisibility = () => {
//     setShowCopyPassword(!showCopyPassword);
//   };

//   const register = (e) => {
//     e.preventDefault();

//     if (copyPassword !== password) {
//       setError("Passwords do not match");
//       return;
//     }

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;

//         set(ref(database, "users/" + user.uid), {
//           username: username,
//           email: user.email,
//         });

//         setError("");
//         setEmail("");
//         setPassword("");
//         setCopyPassword("");
//         setUsername("");
//         window.location.href = "#/home";
//       })
//       .catch((error) => {
//         switch (error.code) {
//           case 'auth/email-already-in-use':
//             setError("Этот имейл уже используется");
//             break;
//           case 'auth/invalid-email':
//             setError("Invalid email format");
//             break;
//           case 'auth/weak-password':
//             setError("Password is too weak");
//             break;
//           default:
//             setError("An error occurred during registration");
//         }
//       });
//   };

//   return (
//     <div className="section">
//       <Link className="back-button white-icon" style={{ position: "absolute", top: "0", left: "20px" }} onClick={() => navigate(-1)}>
//         <FaArrowLeft />
//       </Link>
//       <div className="register-box">
//         <form onSubmit={register}>
//           <h2>Регистрация</h2>
//           <div className="reg-input-box">
//             <span className="icon">
//               <IoPersonOutline />
//             </span>
//             <input
//               type="text"
//               maxLength="12"
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//             <label htmlFor="username">Имя</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon">
//               <IoMailOutline />
//             </span>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <label htmlFor="email">Электронная почта</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
//               {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
//             </span>
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               minLength="6"
//               required
//             />
//             <label htmlFor="password">Пароль</label>
//           </div>
//           <div className="reg-input-box">
//             <span className="icon" onClick={toggleCopyPasswordVisibility} style={{ cursor: "pointer" }}>
//               {showCopyPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
//             </span>
//             <input
//               type={showCopyPassword ? "text" : "password"}
//               id="confirmPassword"
//               value={copyPassword}
//               onChange={(e) => setCopyPassword(e.target.value)}
//               minLength="6"
//               required
//             />
//             <label htmlFor="confirmPassword">Подтвердите пароль</label>
//           </div>
//           <div className="remember-forgot">
//             {/* <label className="checkbox-p">
//               <input type="checkbox" /> <p>Запомнить меня</p>
//             </label> */}
//             <p>Забыли пароль?</p>
//           </div>
//           <button type="submit">Register</button>
//           {error && <p style={{ color: "red", marginTop: "55px", position: "absolute", marginLeft: "50px" }}>{error}</p>}
//           <div className="register-link">
//             <p>
//               Уже есть аккаунт? <Link className="a" to="/signin">Войти</Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignUp;