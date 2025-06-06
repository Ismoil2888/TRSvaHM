import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { getDatabase, ref as databaseRef, onValue, query, orderByChild, startAt, endAt, get, set } from "firebase/database";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import '../SearchPage.css';
import basiclogo from "../basic-logo.png";
import { Link } from "react-router-dom";
import { FaPlusCircle, FaArrowLeft, FaInfo } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import useTranslation from '../hooks/useTranslation';
import { LazyLoadImage } from "react-lazy-load-image-component";

const SearchStudents = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false); // Новое состояние
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [userUid, setUserUid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslation();
  const [userRole, setUserRole] = useState('');
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    // Восстанавливаем состояние из localStorage при инициализации
    const savedState = localStorage.getItem('isMenuOpen');
    return savedState ? JSON.parse(savedState) : true;
  });

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

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "320px" : "110px"),
    transition: "margin 0.3s ease",
  };

  const HeaderDesktop = {
    margin: isMenuOpen ? "11.8px 192px" : "6px 60px",
    transition: "margin 0.3s ease",
  };

  const currentUserHeader = {
    marginRight: isMenuOpen ? "40px" : "30px",
    marginBottom: isMenuOpen ? "0px" : "0px",
    transition: "margin 0.3s ease",
  };

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `messages`);

    // Получение всех сообщений из Firebase
    onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesArray = Object.entries(messagesData).map(([userId, userMessages]) => ({
          userId,
          lastMessage: Object.values(userMessages).pop(), // Последнее сообщение от пользователя
        }));
        setMessages(messagesArray);
      }
    });

    // Загрузка данных текущего пользователя
    const user = auth.currentUser;
    if (user) {
      const userRef = databaseRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserDetails({
            username: data.username || "User",
            avatarUrl: data.avatarUrl || "./default-image.png",
          });
          setRole(data.role || "");
        }
      });

         onValue(userRef, (snapshot) => {
              const userData = snapshot.val();
              // Предполагается, что роль хранится в поле role
              setUserRole(userData?.role || '');
            });
    }
  }, []);

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
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

        // Загружаем историю поиска для конкретного пользователя
        const savedHistory = JSON.parse(localStorage.getItem(`searchHistory_${user.uid}`)) || [];
        setSearchHistory(savedHistory);
      } else {
        navigate("/"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSearch = async (queryText) => {
    setSearchQuery(queryText);

    if (queryText.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const dbRef = databaseRef(getDatabase(), "users");

      // Загружаем все данные пользователей
      const snapshot = await get(dbRef);
      const results = [];

      if (snapshot.exists()) {
        const lowerCaseQuery = queryText.toLowerCase();

        // Фильтруем пользователей по нечувствительному к регистру имени
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const username = userData.username || "";

          if (username.toLowerCase().includes(lowerCaseQuery)) {
            results.push({ uid: childSnapshot.key, ...userData });
          }
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  };

  const saveUserToDatabase = (userId, userData) => {
    const db = getDatabase();
    const userRef = databaseRef(db, `users/${userId}`);

    const newUser = {
      ...userData,
      username_lowercase: userData.username.toLowerCase(), // Добавляем имя в нижнем регистре
    };

    set(userRef, newUser)
      .then(() => console.log("User saved"))
      .catch((error) => console.error("Error saving user:", error));
  };


  const goToProfile = (userId) => {
    if (userUid) {
      const visitedUser = searchResults.find((user) => user.uid === userId);
      if (visitedUser) {
        const updatedHistory = [visitedUser, ...searchHistory.filter(item => item.uid !== visitedUser.uid)];
        setSearchHistory(updatedHistory);
        localStorage.setItem(`searchHistory_${userUid}`, JSON.stringify(updatedHistory));
      }
      navigate(`/profile/${userId}`);
    }
  };

  const goToProfileSettings = () => {
    navigate("/authdetails");
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(`searchHistory_${userUid}`);
  };

  const removeFromHistory = (userId) => {
    const updatedHistory = searchHistory.filter(user => user.uid !== userId);
    setSearchHistory(updatedHistory);
    localStorage.setItem(`searchHistory_${userUid}`, JSON.stringify(updatedHistory));
  };

  const goToProfileFromHistory = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      // Очищаем локальные данные
      setSearchHistory([]);
      localStorage.removeItem(`searchHistory_${auth.currentUser.uid}`);
      navigate("/");
    });
  };

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

  return (
    <div className="glava">
     <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img style={{ width: "50px", height: "45px" }} src={basiclogo} alt="" />
          {isMenuOpen ? (
            <>
              <h2>{t('facultname')}</h2>
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
            {isMenuOpen && <span className="txt">{t('main')}</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/searchpage" className="menu-item">
              <FiSearch className="menu-icon" style={{ background: "linear-gradient(60deg, rgb(219, 98, 98), rgba(0, 128, 107, 0.575), rgba(108, 108, 216, 0.66))", color: "white" }} />
              {isMenuOpen && <span className="txt">{t('findstudents')}</span>}
            </Link>
            <Link to="/teachers" className="menu-item">
              <FiUserCheck className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('teachers')}</span>}
            </Link>
            <Link to="/library" className="menu-item">
              <FiBookOpen className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('library')}</span>}
            </Link>
          </div>
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" />
            {isMenuOpen && <span className="txt">{t('profile')}</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/chats" className="menu-item">
              <FiMessageSquare className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('messages')}</span>}
            </Link>
            <Link to="/notifications" className="menu-item">
              <FiBell className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('notifications')}</span>}
            </Link>
          </div>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" />
            {isMenuOpen && <span className="txt">{t('settings')}</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
        {t('facultname')}
          {isMenuOpen &&
            <div>
              <p className="txt">&copy; 2025 {t("rights")}.</p>
            </div>
          }
        </div>
      </div>
      <div className="search-students-page" style={mainContentStyle}>
      <header>
             <nav className="header-nav" style={HeaderDesktop}>
                  <ul className="header-ul">
                    <li><Link to="/jarvisintropage" className="txt">{t('voiceassistant')}</Link></li>
                    <li><Link to="/about" className="txt">{t('aboutfaculty')}</Link></li>
      
                    {/* Дополнительные разделы для декана */}
                    {userRole === 'dean' && (
                      <>
                        <li>
                          <Link to="/987654321admin-login">
                            <span className="txt">Админ-Панель</span>
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
      
                  {(role === "teacher" || role === "dean") && (
                    <>
                      <ul className="header-ul">
                        <li><Link to="/post" className="txt">{t('addpost')}</Link></li>
                      </ul>
                    </>
                  )}
      
                  <Link to="/myprofile">
                    <div className="currentUserHeader" style={currentUserHeader}>
                      <img
                        src={userDetails.avatarUrl || "./default-image.png"}
                        alt="User Avatar"
                        className="user-avatar"
                      />
                      <span style={{ fontSize: "18px", color: "lightgreen" }}>
                        {userDetails.username}
                      </span>
                    </div>
                  </Link>
                </nav>

          <div className="header-nav-2">
            <img src={basiclogo} width="50px" alt="logo" style={{ marginLeft: "10px" }} />

            <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>{t('findstudents')}</ul>

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
                {/* <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li> */}
                <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
                <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
                <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
              </ul>
            </div>
          </div>
        </header>

        <div className="chat-page-header">
          <h2 className="txt">{t('findstudents')}</h2>
          <div className="chat-page-search-icon" onClick={() => setShowSearch(!showSearch)}>
            <FaSearch className="fasearch"/>
          </div>
        </div>

        {showSearch && (
          <>
            <div className="chat-page-search-bar">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Искать пользователей"
              />
              <FaTimes className="chat-page-close-search" onClick={() => setShowSearch(false)} />
            </div>

            {/* Если пользователь не вводит текст и не в фокусе - показываем историю */}
            {searchHistory.length > 0 && !isInputFocused && searchQuery === "" && (
              <div className="chat-page-search-history">
                <div className="chat-page-history-header">
                  <h3 style={{ color: "grey" }}>Недавнее</h3>
                  <span onClick={clearSearchHistory} className="chat-page-clear-history">
                    Очистить все
                  </span>
                </div>
                <div className="search-history-list">
                  {searchHistory.map((user) => (
                    <div
                      key={user.uid}
                      className="chat-page-chat-item"
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <LazyLoadImage src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka skeleton-media-avatars" />
                        <div
                          className="chat-page-chat-info"
                          onClick={() => goToProfileFromHistory(user.uid)}
                        >
                          <h3 className="txt">{user.username}</h3>
                          <p>{user.aboutMe || "Информация не указана"}</p>
                        </div>
                      </div>
                      <div style={{ marginLeft: "15px" }}>
                        <FaTimes className="chat-page-remove-from-history" onClick={() => removeFromHistory(user.uid)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showSearch && (
          <div className="chat-page-chat-list">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.uid} className="chat-page-chat-item" onClick={() => goToProfile(user.uid)}>
                  <LazyLoadImage src={user.avatarUrl || "./default-image.png"} alt={user.username} className="chat-page-avatarka skeleton-media-avatars" />
                  <div className="chat-page-chat-info">
                    <h3 className="txt">{user.username}</h3>
                    <p>{user.aboutMe || "Информация не указана"}</p>
                  </div>
                </div>
              ))
            ) : (
              searchQuery.trim() !== "" && <p style={{ color: "whitesmoke" }}>Ничего не найдено</p>
            )}
          </div>
        )}

        <div className="footer-nav">
          <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
          <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon  active-icon" /></Link>
          <Link to="/about"><FaInfo className="footer-icon" /></Link>
          {(role === "teacher" || role === "dean") && <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>}
          <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
          <Link to="/myprofile">
            <img src={userAvatarUrl} alt="" className="footer-avatar skeleton-media-avatars" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchStudents;