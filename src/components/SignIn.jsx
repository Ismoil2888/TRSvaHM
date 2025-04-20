import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as dbRef, get } from "firebase/database";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../SignUp-SignIn.css";
import { FaArrowLeft } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline, IoMailOutline } from "react-icons/io5";

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1) При монтировании проверяем, не заблокирован ли IP
  useEffect(() => {
    let isMounted = true;
    axios.get('https://api.ipify.org?format=json')
      .then(({ data }) => data.ip)
      .then(ip => {
        if (!isMounted) return;
        const db = getDatabase();
        return get(dbRef(db, `blockedIPs/${ip}`))
          .then(snap => ({ ip, blocked: snap.exists() }));
      })
      .then(({ ip, blocked }) => {
        if (blocked) {
          alert(`Ваш IP ${ip} заблокирован.`);
          auth.signOut();
          navigate('/blocked', { replace: true });
        }
      })
      .catch(() => {
        // если не удалось получить IP или проверить — молча продолжаем
      });
    return () => { isMounted = false; };
  }, [navigate]);

  // 2) Если уже залогинен — сразу на /home
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) navigate("/home", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(p => !p);
  };

  const logIn = e => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setError("");
        setEmail("");
        setPassword("");
        navigate("/home", { replace: true });
      })
      .catch(() => {
        setError("Учетная запись или пароль неверны!");
      });
  };

  return (
    <div className="section">
      <Link
        className="back-button white-icon"
        style={{ position: "absolute", top: 0, left: 20 }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
      </Link>
      <div className="login-box">
        <form onSubmit={logIn}>
          <h2>Вход</h2>

          <div className="input-box">
            <span className="icon"><IoMailOutline/></span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label>Электронная почта</label>
          </div>

          <div className="input-box">
            <span
              className="icon"
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <IoEyeOutline/> : <IoEyeOffOutline/>}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength="6"
              required
            />
            <label>Пароль</label>
          </div>

          <div className="remember-forgot">
            <p>Забыли пароль?</p>
          </div>

          <button type="submit" className="reg-login-button">
            Войти
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="register-link">
            <p>
              Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;








// import React, { useState, useEffect } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../firebase";
// import { Link } from "react-router-dom";
// import { useNavigate } from 'react-router-dom';
// import { IoEyeOutline, IoEyeOffOutline, IoMailOutline } from "react-icons/io5";
// import "../SignUp-SignIn.css";
// import { FaArrowLeft } from "react-icons/fa";
// import axios from 'axios'
// import { getDatabase, ref as dbRef, get } from "firebase/database"

// const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false); // Состояние для показа/скрытия пароля

//   useEffect(() => {
//     axios.get('https://api.ipify.org?format=json')
//       .then(({ data }) => data.ip)
//       .then(ip => {
//         const db = getDatabase()
//         return get(dbRef(db, `blockedIPs/${ip}`)).then(snap => ({ ip, blocked: snap.exists() }))
//       })
//       .then(({ ip, blocked }) => {
//         if (blocked) {
//           alert(`Ваш IP ${ip} заблокирован.`)
//           auth.signOut()
//           navigate('/blocked')
//         }
//       })
//       .catch(() => {})
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

//   const navigate = useNavigate();

//   const logIn = (e) => {
//     e.preventDefault();

//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         console.log(userCredential);
//         setError("");
//         setEmail("");
//         setPassword("");
//         window.location.href = "#/home"; // Перенаправление после успешного входа
//       })
//       .catch((error) => {
//         console.log(error);
//         setError("Учетная запись или пароль неверны!");
//       });
//   };

//   return (
//     <div className="section">
//       <Link className="back-button white-icon" style={{ position: "absolute", top: "0", left: "20px" }} onClick={() => navigate(-1)}>
//         <FaArrowLeft />
//       </Link>
//       <div className="login-box">
//         <form onSubmit={logIn}>
//           <h2>Вход</h2>
//           <div className="input-box">
//             <span className="icon">
//               <IoMailOutline /> {/* Иконка email */}
//             </span>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <label>Электронная почта</label>
//           </div>
//           <div className="input-box">
//             <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
//               {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />} {/* Переключение иконки */}
//             </span>
//             <input
//               id="password"
//               type={showPassword ? "text" : "password"} // Переключение типа input
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               minLength="6"
//               required
//             />
//             <label htmlFor="password">Пароль</label>
//           </div>
//           <div className="remember-forgot">
//             <p>Забыли пароль?</p>
//           </div>
//           <button type="submit" className="reg-login-button">Login</button>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//           <div className="register-link">
//             <p>
//               Нет аккаунта? <Link className="a" to="/signup">Зарегистрироваться</Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignIn;