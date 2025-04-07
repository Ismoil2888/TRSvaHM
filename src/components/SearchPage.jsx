import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { getDatabase, ref as databaseRef, onValue } from "firebase/database";
import { auth } from "../firebase";
import '../SearchPage.css';
import basiclogo from "../basic-logo.png";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaPlusCircle, FaInfo } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import useTranslation from '../hooks/useTranslation';

const SearchPage = () => {
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const t = useTranslation();
  const [userRole, setUserRole] = useState('');
  const [role, setRole] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);
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
    marginLeft: isMobile ? (isMenuOpen ? "340px" : "0px") : (isMenuOpen ? "320px" : "110px"),
    transition: "margin 0.3s ease",
  };

  const currentUserHeader = {
    marginRight: isMenuOpen ? "40px" : "30px",
    marginBottom: isMenuOpen ? "11px" : "8px",
    transition: "margin 0.3s ease",
  };

  const HeaderDesktop = {
    margin: isMenuOpen ? "11.8px 192px" : "6px 60px",
    transition: "margin 0.3s ease",
  };

  useEffect(() => {
    const database = getDatabase();
    // Загрузка данных текущего пользователя
    const user = auth.currentUser;
    // const database = getDatabase();
    if (user) {
      const userRef = databaseRef(database, `users/${user.uid}`);
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

  const toggleMenuMobile = () => {
    if (isMenuOpenMobile) {
      setTimeout(() => {
        setIsMenuOpenMobile(false);
      }, 0);
    } else {
      setIsMenuOpenMobile(true);
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, type: 'spring', stiffness: 50 }
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 50 },
    },
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
              <FiSearch className="menu-icon" style={{ color: "orange" }} />
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
      <div className="search-page" style={mainContentStyle}>
        <header>
             <nav className="header-nav" style={HeaderDesktop}>
                  <ul className="header-ul">
                    <li><Link to="/jarvisintropage" className="txt">{t('voiceassistant')}</Link></li>
                    <li><Link to="/about" className="txt">{t('aboutefaculty')}</Link></li>
      
                    {/* Дополнительные разделы для декана */}
                    {userRole === 'dean' && (
                      <>
                        <li>
                          <Link to="/admin">
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
                        style={{ width: "35px", height: "35px" }}
                      />
                      <span style={{ fontSize: "20px", color: "lightgreen" }}>
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
                <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
                <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
                <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
                <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
              </ul>
            </div>

          </div>
        </header>

        <div className="search-main">
          <div className="h2-icon-block">
            <h2 className="txt">{t('find')}!</h2>

            <div className="search-page-search-icon">
              <FaSearch />
            </div>
          </div>

          <section className="search-blocks">
            <div className="search-block1" style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
              <Link to="/searchstudents">
                <div className="students-search sb">
                  <FontAwesomeIcon icon={faUser} className="footer-icon white-icon" />
                  <p className="txt">{t('students')}</p>
                </div>
              </Link>

              <Link to="/teachers">
                <div className="teachers-search sb">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="footer-icon white-icon" />
                  <p className="txt">{t('teachers')}</p>
                </div>
              </Link>
            </div>

            <div className="search-block2" style={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
              <Link to="/library">
                <div className="books-search sb">
                  <FontAwesomeIcon icon={faBook} className="footer-icon white-icon" />
                  <p className="txt">{t('books')}</p>
                </div>
              </Link>

              <Link to="/about">
                <div className="schedule-search sb">
                  <FontAwesomeIcon icon={faCalendarAlt} className="footer-icon white-icon" />
                  <p className="txt">{t('schedule')}</p>
                </div>
              </Link>
            </div>
          </section>
        </div>

        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.nav
            variants={navbarVariants}
            initial="hidden"
            animate="visible"
            className="footer-nav"
          >
            <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" style={{}} /></Link>
            <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon active-icon" /></Link>
            <Link to="/about"><FaInfo className="footer-icon" /></Link>
            {role === "teacher" && <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>}
            <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
            <Link to="/myprofile">
              <img src={userDetails.avatarUrl || "./default-image.png"} alt="User Avatar" className="footer-avatar" />
            </Link>
          </motion.nav>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;