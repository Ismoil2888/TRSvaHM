import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, remove, update } from "firebase/database";
import { auth } from "../firebase";
import defaultAvatar from "../default-image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaArrowLeft } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiUserCheck, FiBookOpen, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";
import "../NotificationsPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUserId = auth.currentUser?.uid;
  const navigate = useNavigate();
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = auth.currentUser?.uid; // Текущий пользователь
  const [isMobile, setIsMobile] = useState(false);

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
  const toggleMenu = () => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isMenuOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "360px" : "80px"),
    transition: "margin 0.3s ease",
  };

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const toggleMenuu = () => {
    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 0);
    } else {
      setIsMenuOpen(true);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    const db = getDatabase();
    const notificationsRef = dbRef(db, `notifications/${currentUserId}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const notificationsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        setNotifications(
          notificationsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );
      } else {
        setNotifications([]); // Если данных нет, очищаем состояние
      }
    });

    return () => unsubscribe(); // Убираем слушатель при размонтировании компонента
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const db = getDatabase();
    const notificationsRef = dbRef(db, `notifications/${currentUserId}`);

    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedNotifications = {};
        for (const key in data) {
          updatedNotifications[key] = {
            ...data[key],
            isRead: true,
          };
        }

        // Обновляем уведомления в базе данных
        update(notificationsRef, updatedNotifications).catch((error) => {
          console.error("Ошибка при обновлении статуса уведомлений:", error);
        });
      }
    });

    // Сбрасываем локальный счетчик непрочитанных уведомлений
    setUnreadCount(0);
  }, [currentUserId]);

  const handleDeleteNotification = (notificationId) => {
    if (!currentUserId || !notificationId) return;

    const db = getDatabase();
    const notificationRef = dbRef(db, `notifications/${currentUserId}/${notificationId}`);
    remove(notificationRef)
      .then(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      })
      .catch((error) => {
        console.error("Ошибка при удалении уведомления:", error);
      });
  };

  return (
    <div className="glava">
      <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img style={{ width: "50px", height: "45px" }} src={ttulogo} alt="" />
          {isMenuOpen ? (
            <>
              <h2>TTU</h2>
              <FiChevronLeft
                className="toggle-menu"
                onClick={toggleMenu}
              />
            </>
          ) : (
            <FiChevronRight
              className="toggle-menu"
              onClick={toggleMenu}
            />
          )}
        </div>

        <nav className="menu-items">
          <Link to="/" className="menu-item">
            <FiHome className="menu-icon" />
            {isMenuOpen && <span>Главная</span>}
          </Link>
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
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <Link to="/chats" className="menu-item">
            <FiMessageSquare className="menu-icon" />
            {isMenuOpen && <span>Сообщения</span>}
          </Link>
          <Link to="/notifications" className="menu-item">
            <FiBell className="menu-icon" style={{ borderBottom: "1px solid rgb(200, 255, 0)", borderRadius: "15px", padding: "5px" }} />
            {isMenuOpen && <span>Уведомления</span>}
          </Link>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" />
            {isMenuOpen && <span>Настройки</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
          <img
            src={basiclogo}
            alt="logo"
            className="tiklogo"
          />
          {isMenuOpen && (
            <span style={{ fontSize: "35px", fontWeight: "bold", color: "#9daddf" }}>TIK</span>
          )}
        </div>
      </div>
      <div className="notifications-page" style={mainContentStyle}>
        <header className="head-line">
          {/* <nav>
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/about">О факультете</Link></li>
            <li><Link to="/teachers">Преподаватели</Link></li>
            <li><Link to="/schedule">Расписание</Link></li>
            <li><Link to="/library">Библиотека</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Уведомления</ul>
          <ul>
          </ul>
        </nav> */}

          <div className="header-nav-2">

            <Link className="back-button" style={{ marginLeft: "15px" }} onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </Link>

            <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>Уведомления</ul>

            <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenuu}>
              <span className="bm-span"></span>
              <span className="bm-span"></span>
              <span className="bm-span"></span>
            </div>

            <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>
              <ul>
                <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{ color: "red" }} /> Главная</Link></li>
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

        <main className="notifications-content">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-card">
                <img
                  src={notification.avatarUrl || defaultAvatar}
                  alt="Sender Avatar"
                  className="notification-avatar skeleton-media-avatars"
                  onClick={() => goToProfile(notification.userId)}
                />
                <div className="notification-info">
                  <p className="notification-text">
                    {notification.type === 'comment' ? (
                      <>
                        Пользователь <strong onClick={() => goToProfile(notification.userId)}>{notification.username}</strong> написал под
                        вашим постом комментарий: "{notification.comment}"
                      </>
                    ) : notification.type === 'like' ? (
                      <>
                        Пользователю <strong onClick={() => goToProfile(notification.userId)}>{notification.username}</strong> понравилась ваша публикация
                      </>
                    ) : null}
                  </p>
                  <p className="notification-time">
                    {notification.timestamp}
                  </p>
                </div>
                <button
                  className="delete-notification-button"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  ✖
                </button>
              </div>
            ))
          ) : (
            <p className="no-notifications">У вас пока нет уведомлений.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;