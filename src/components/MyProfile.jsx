//упрощенка
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getDatabase, ref as databaseRef, onValue, update, query, orderByChild, equalTo } from "firebase/database";
// import React, { useEffect, useState, useRef } from "react";
// import { auth, database } from "../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import { FaEllipsisV, FaArrowLeft, FaLock, FaRegAddressBook } from "react-icons/fa";
// import { FcAbout } from "react-icons/fc";
// import "../MyProfile.css";
// import "../App.css";

// const MyProfile = () => {
//   const [authUser, setAuthUser] = useState(null);
//   const [username, setUsername] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [showMenu, setShowMenu] = useState(false);
//   const [aboutMe, setAboutMe] = useState("Информация не указана");
//   const [notification, setNotification] = useState("");
//   const [notificationType, setNotificationType] = useState("");
//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
//   const menuRef = useRef(null);
//   const [userUid, setUserUid] = useState(null);
//   const navigate = useNavigate();

//   const handleClickOutside = (e) => {
//     if (menuRef.current && !menuRef.current.contains(e.target)) {
//       setShowMenu(false);
//     }
//   };

//   useEffect(() => {
//     const auth = getAuth();

//     // Отслеживаем аутентификацию пользователя
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserUid(user.uid);

//                 // Получаем URL аватарки пользователя
//                 const db = getDatabase();
//                 const userRef = databaseRef(db, `users/${user.uid}`);
//                 onValue(userRef, (snapshot) => {
//                   const userData = snapshot.val();
//                   if (userData && userData.avatarUrl) {
//                     setUserAvatarUrl(userData.avatarUrl);
//                   } else {
//                     setUserAvatarUrl("./default-image.png");
//                   }
//                 });

//       } else {
//         navigate("/");
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);

//     const listen = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthUser(user);

//         const userRef = databaseRef(database, "users/" + user.uid);
//         onValue(userRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             setUsername(data.username || "User");
//             setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
//             setStatus(data.status || "offline");
//             setLastActive(data.lastActive || "");
//             setAvatarUrl(data.avatarUrl || "./default-image.png");
//             setAboutMe(data.aboutMe || "Информация не указана");
//           }
//         });

//         const requestRef = query(
//           databaseRef(database, "requests"),
//           orderByChild("email"),
//           equalTo(user.email)
//         );
//         onValue(requestRef, (snapshot) => {
//           if (snapshot.exists()) {
//             const requestData = Object.values(snapshot.val())[0];
//             setIdentificationStatus(
//               requestData.status === "accepted" ? "идентифицирован" : "не идентифицирован"
//             );
//           } else {
//             setIdentificationStatus("не идентифицирован");
//           }
//         });

//         update(userRef, { status: "online" });

//         document.addEventListener("visibilitychange", () => {
//           if (document.visibilityState === "hidden") {
//             update(userRef, {
//               status: "offline",
//               lastActive: new Date().toLocaleString(),
//             });
//           } else {
//             update(userRef, { status: "online" });
//           }
//         });

//         window.addEventListener("beforeunload", () => {
//           update(userRef, {
//             status: "offline",
//             lastActive: new Date().toLocaleString(),
//           });
//         });
//       } else {
//         setAuthUser(null);
//         setUsername("");
//         setPhoneNumber("");
//         setStatus("offline");
//         setAvatarUrl("./default-image.png");
//       }
//     });

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const renderStatus = () => {
//     if (status === "online") {
//       return <span className="status-online">в сети</span>;
//     } else {
//       return <span className="status-offline">был(а) в сети: {lastActive}</span>;
//     }
//   };

//   return (
//     <div className="my-profile-container">
//       {authUser ? (
//         <div className="my-profile-content">
//           {notification && (
//             <div className={`notification ${notificationType}`}>{notification}</div>
//           )}

//           <div className="my-profile-header">
//             <Link className="back-button" onClick={() => navigate(-1)}>
//               <FaArrowLeft />
//             </Link>

//             <div className="avatar-section">
//               <img 
//                 src={avatarUrl} 
//                 alt="Avatar" className="avatar" 
//                 onClick={() => setIsAvatarModalOpen(true)}
//               />
//             </div>

//             {isAvatarModalOpen && (
//            <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//              <div className="avatar-overlay">
//                <img
//                  src={avatarUrl}
//                  alt="Avatar"
//                  className="full-size-avatar"
//                  onClick={() => setIsAvatarModalOpen(false)}
//                />
//              </div>
//            </div>
//          )}

//             <div className="username-section">
//               <h2>{username}</h2>
//               <p style={{ color: "lightgreen" }}>{renderStatus()}</p>
//             </div>

//             <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//               <FaEllipsisV />
//             </div>

//             {showMenu && (
//               <div className="menu-dropdown" ref={menuRef}>
//                 <Link to="/authdetails">
//                   <button>Редактировать профиль</button>
//                 </Link>
//               </div>
//             )}
//           </div>

//           <div className="profile-info">
//             <div className="info-section account">
//               <div>
//                 <h3>Номер телефона</h3>
//                 <p>{phoneNumber}</p>
//               </div>
//               <FaRegAddressBook 
//               style={{ fontSize: "22px" }} 
//               />
//             </div>

//             <div className="info-section osebe">
//               <div>
//                 <h3>О себе</h3>
//                 <p>{aboutMe}</p>
//               </div>
//               <FcAbout 
//               className="edit-icon-auth" 
//               style={{ fontSize: "25px", cursor: "pointer" }} 
//               />
//             </div>

//             <div className="info-section">
//               <div className="ident-block-basic">
//                 <div className="ident-block1">
//                   <h3>Идентификация</h3>
//                   <p>{identificationStatus}</p>
//                 </div>
//                 <div className="ident-block2">
//                   <FaLock
//                     style={{
//                       color: identificationStatus === "идентифицирован" ? "#0AFFFF" : "red",
//                       fontSize: "20px",
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <h2 className="signed-out-h2" data-text="T I K">
//           T I K
//         </h2>
//       )}
//     </div>
//   );
// };

// export default MyProfile;




















//оригинал
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as databaseRef, onValue, update, query, orderByChild, equalTo } from "firebase/database";
import React, { useEffect, useState, useRef } from "react";
import { auth, database } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FaEllipsisV, FaArrowLeft, FaLock, FaRegAddressBook, FaUsers, FaScroll, FaUserGraduate } from "react-icons/fa";
import { FcAbout } from "react-icons/fc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { RiSettingsLine } from "react-icons/ri";
import { FaPlusCircle } from "react-icons/fa";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";
import "../MyProfile.css";
import "../App.css";
import useTranslation from '../hooks/useTranslation';

const MyProfile = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [showMenu, setShowMenu] = useState(false);
  const [aboutMe, setAboutMe] = useState("Информация не указана");
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const t = useTranslation();
  const [identificationStatus, setIdentificationStatus] = useState(t('notident'));
  const menuRef = useRef(null);
  const [userUid, setUserUid] = useState(null);
  const [role, setRole] = useState("");
  const [teacherTitle, setTeacherTitle] = useState("");
  const [teacherCathedra, setTeacherCathedra] = useState("");
  const [TeacherSubject, setTeacherSubject] = useState("");
  const [TeacherLogin, setTeacherLogin] = useState("");

  const [userFaculty, setUserFaculty] = useState("не известно");
  const [userCourse, setUserCourse] = useState("не известно");
  const [userGroup, setUserGroup] = useState("не известно");

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    // Восстанавливаем состояние из localStorage при инициализации
    const savedState = localStorage.getItem('isMenuOpen');
    return savedState ? JSON.parse(savedState) : true;
  });

  const teacherData = {
    name: username, // или разделите имя и фамилию, если они хранятся отдельно
    subject: TeacherSubject,   // если есть соответствующее поле
    photo: avatarUrl,
    cathedra: teacherCathedra,
    runk: teacherTitle,
    email: TeacherLogin,
    // можно добавить другие поля по необходимости
  };  

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('isMenuOpen', JSON.stringify(isMenuOpen));
  }, [isMenuOpen]);

  // Обработчик изменения размера окна
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 700;
      setIsMobile(mobile);
      if (mobile) {
        setIsMenuOpen(false);
      } else {
        // Восстанавливаем состояние только для десктопа
        const savedState = localStorage.getItem('isMenuOpen');
        setIsMenuOpen(savedState ? JSON.parse(savedState) : true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Модифицированная функция переключения меню
  const toggleMenuDesktop = () => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isMenuOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();

    // Отслеживаем аутентификацию пользователя
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Пользователь вошел в систему, используем его UID
        setUserUid(user.uid);

        // Получаем URL аватарки пользователя
        const db = getDatabase();
        const userRef = databaseRef(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.avatarUrl) {
            setUserAvatarUrl(userData.avatarUrl);
          } else {
            setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
          }
        });

      } else {
        navigate("/"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Добавляем обработчик клика вне меню
    document.addEventListener("mousedown", handleClickOutside);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        const userRef = databaseRef(database, `users/${user.uid}`);
        const requestRef = query(databaseRef(database, "requests"), orderByChild("email"), equalTo(user.email));

        // Подписка на обновления пользователя
        const unsubscribeUser = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername((prev) => (prev !== data.username ? data.username || "User" : prev));
            setPhoneNumber((prev) => (prev !== data.phoneNumber ? data.phoneNumber || t('addtelnumber') : prev));
            setStatus((prev) => (prev !== data.status ? data.status || "offline" : prev));
            setLastActive((prev) => (prev !== data.lastActive ? data.lastActive || "" : prev));
            setAvatarUrl((prev) => (prev !== data.avatarUrl ? data.avatarUrl || "./default-image.png" : prev));
            setAboutMe((prev) => (prev !== data.aboutMe ? data.aboutMe || t('infonot') : prev));
            setRole(data.role || "");
            setTeacherCathedra(data.cathedra || "не известно");
            setTeacherSubject(data.subject || "");
            setTeacherLogin(data.email || "");
            if (data.role === "teacher") {
              setTeacherTitle(data.runk || "Не указано");
            }
          }
        });

        // Подписка на статус идентификации
        const unsubscribeRequest = onValue(requestRef, (snapshot) => {
          if (snapshot.exists()) {
            const requestData = Object.values(snapshot.val())[0];
            const newStatus = requestData.status === "accepted" ? t('ident') : t('notident');
            const newFaculty = requestData.faculty || "не известно";
            const newCourse = requestData.course || "не известно";
            const newGroup = requestData.group || "не известно";

            // Обновляем только если данные действительно изменились
            setIdentificationStatus((prev) => (prev !== newStatus ? newStatus : prev));
            setUserFaculty((prev) => (prev !== newFaculty ? newFaculty : prev));
            setUserCourse((prev) => (prev !== newCourse ? newCourse : prev));
            setUserGroup((prev) => (prev !== newGroup ? newGroup : prev));
          } else {
            setIdentificationStatus(t('notident'));
            setUserFaculty("не известно");
            setUserCourse("не известно");
            setUserGroup("не известно");
          }
        });

        // Устанавливаем статус пользователя как "онлайн"
        update(userRef, { status: "online" });

        // Обновляем статус при сворачивании или выходе пользователя
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            update(userRef, { status: "offline", lastActive: new Date().toLocaleString() });
          } else {
            update(userRef, { status: "online" });
          }
        };

        const handleBeforeUnload = () => {
          update(userRef, { status: "offline", lastActive: new Date().toLocaleString() });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Очистка подписок при размонтировании
        return () => {
          unsubscribeUser();
          unsubscribeRequest();
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      } else {
        setAuthUser(null);
        setUsername("");
        setPhoneNumber("");
        setStatus("offline");
        setAvatarUrl("./default-image.png");
      }
    });

    return () => {
      unsubscribeAuth(); // ✅ Корректная отписка от onAuthStateChanged()
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);

  const toggleMenuMobile = () => {
    if (isMenuOpenMobile) {
      setTimeout(() => {
        setIsMenuOpenMobile(false);
      }, 0);
    } else {
      setIsMenuOpenMobile(true);
    }
  };

  const renderStatus = () => {
    if (status === "online") {
      return <span className="status-online">{t('status')}</span>;
    } else {
      return <span className="status-offline">{t('wasonline')}: {lastActive}</span>;
    }
  };

  return (
    <div className="my-profile-container">
      <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img style={{ width: "50px", height: "45px" }} src={ttulogo} alt="" />
          {isMenuOpen ? (
            <>
              <h2>TTU</h2>
              <FiChevronLeft
                className="toggle-menu"
                onClick={toggleMenuDesktop}
              />
            </>
          ) : (
            <FiChevronRight
              className="toggle-menu"
              onClick={toggleMenuDesktop}
            />
          )}
        </div>

        <nav className="menu-items">
          <Link to="/" className="menu-item" style={{ paddingRight: "15px" }}>
            <FiHome className="menu-icon" />
            {isMenuOpen && <span>Главная</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/searchpage" className="menu-item">
              <FiSearch className="menu-icon" />
              {isMenuOpen && <span>Поиск</span>}
            </Link>
            <Link to="/teachers" className="menu-item">
              <FiUserCheck className="menu-icon" />
              {isMenuOpen && <span>Преподаватели</span>}
            </Link>
            <Link to="/library" className="menu-item">
              <FiBookOpen className="menu-icon" />
              {isMenuOpen && <span>Библиотека</span>}
            </Link>
          </div>
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" style={{ borderBottom: "1px solid rgb(255, 255, 255)", borderRadius: "15px", padding: "5px" }} />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/chats" className="menu-item">
              <FiMessageSquare className="menu-icon" />
              {isMenuOpen && <span>Сообщения</span>}
            </Link>
            <Link to="/notifications" className="menu-item">
              <FiBell className="menu-icon" />
              {isMenuOpen && <span>Уведомления</span>}
            </Link>
          </div>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" />
            {isMenuOpen && <span>Настройки</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
          TRSvaHM
          {isMenuOpen &&
            <div>
              <p>&copy; 2025 Все права защищены.</p>
            </div>
          }
        </div>
      </div>
      <header className="head-line">

        <div className="header-nav-2">

          <Link to="/authdetails">
            <RiSettingsLine style={{ color: "white", fontSize: "25px", marginLeft: "15px" }} />
          </Link>

          <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>{t('profile')}</ul>

          <div className={`burger-menu-icon ${isMenuOpenMobile ? 'open' : ''}`} onClick={toggleMenuMobile}>
            <span className="bm-span"></span>
            <span className="bm-span"></span>
            <span className="bm-span"></span>
          </div>


          <div className={`burger-menu ${isMenuOpenMobile ? 'open' : ''}`}>
            <ul>
              <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
              <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
              <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
              <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
              <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
              <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
              <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
            </ul>
          </div>

        </div>
      </header>

      {authUser ? (
        <div className="my-profile-content">
          {notification && (
            <div className={`notification ${notificationType}`}>{notification}</div>
          )}

          <div className="my-profile-header">
            <Link className="back-button" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </Link>

            <div className="avatar-section">
              <img
                src={avatarUrl}
                alt="Avatar" className="avatar"
                onClick={() => setIsAvatarModalOpen(true)}
              />
            </div>

            {isAvatarModalOpen && (
              <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
                <div className="avatar-overlay">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="full-size-avatar"
                    onClick={() => setIsAvatarModalOpen(false)}
                  />
                </div>
              </div>
            )}

            <div className="username-section">
              <h2>{username}</h2>
              <p style={{ color: "lightgreen" }}>{renderStatus()}</p>
            </div>

            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown" ref={menuRef}>
                <Link to="/authdetails">
                  <button>{t('editprofile')}</button>
                </Link>
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="info-section account">
              <div>
                <h3>{t('telnumber')}</h3>
                <p>{phoneNumber}</p>
              </div>
              <FaRegAddressBook
                style={{ fontSize: "22px" }}
              />
            </div>

            <div className="info-section osebe">
              <div>
                <h3>{t('about')}</h3>
                <p>{aboutMe}</p>
              </div>
              <FcAbout
                className="edit-icon-auth"
                style={{ fontSize: "25px", cursor: "pointer" }}
              />
            </div>

            <div className="info-section">
              <div className="ident-block-basic">
                <div className="ident-block1">
                  <h3>{t('identification')}</h3>
                  <p>{identificationStatus}</p>
                </div>
                <div className="ident-block2">
                  <FaLock
                    style={{
                      color: identificationStatus === t('ident') ? "#0AFFFF" : "red",
                      fontSize: "20px",
                    }}
                  />
                </div>
              </div>
            </div>

            {role === "teacher" ? (
              <>
                <div className="info-section">
                  <h3>{t('cathedra')}:</h3>
                  <p>{teacherCathedra}</p>
                </div>

                <div className="rsl" style={{ display: "flex" }}>
                  <h3>Звание:</h3>
                  <p style={{ fontSize: "17px", marginLeft: "15px" }}>{teacherTitle}</p>
                </div>
                <div className="rsl" style={{ display: "flex" }}>
                  <h3>Предмет:</h3>
                  <p style={{ fontSize: "17px", marginLeft: "15px" }}>{TeacherSubject}</p>
                </div>
                <div style={{marginTop: "15px"}}>
                <Link to={`/teacher-profile/${userUid}`} state={{ teacher: teacherData }}>Перейти в личный Кабинет</Link>
                </div>
              </>
            ) : (
              <>
                <div className="info-section">
                  <h3>{t('cathedra')}:</h3>
                  <p>{userFaculty}</p>
                </div>
                <div className="info-section" style={{ display: "flex" }}>
                  <h3>{t('course')}:</h3>
                  <p style={{ fontSize: "17px", marginLeft: "15px" }}>{userCourse}</p>
                </div>
                <div className="info-section" style={{ display: "flex" }}>
                  <h3>{t('group')}:</h3>
                  <p style={{ fontSize: "17px", marginLeft: "15px" }}>{userGroup}</p>
                </div>
              </>
            )}

          </div>

          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="footer-nav">
              <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" style={{}} /></Link>
              <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
              {role === "teacher" && <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>}
              <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
              <Link to="/myprofile">
                <img src={userAvatarUrl} alt="" className="footer-avatar skeleton-media-avatars active-icon" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="signed-out-h2" data-text="T I K">
          T I K
        </h2>
      )}
    </div>
  );
};

export default MyProfile;