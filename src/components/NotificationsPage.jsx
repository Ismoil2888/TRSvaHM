import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, remove, push, update } from "firebase/database";
import { auth } from "../firebase";
import defaultAvatar from "../default-image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaArrowLeft } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiUserCheck, FiBookOpen, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";
import "../NotificationsPage.css";
import useTranslation from '../hooks/useTranslation';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUserId = auth.currentUser?.uid;
  const navigate = useNavigate();
  const t = useTranslation();
  const [currentUserData, setCurrentUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = auth.currentUser?.uid; // Текущий пользователь
  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);
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
  const toggleMenuDesktop = () => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isMenuOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "340px" : "110px"),
    transition: "margin 0.3s ease",
  };

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const toggleMenuMobile = () => {
    if (isMenuOpenMobile) {
      setTimeout(() => {
        setIsMenuOpenMobile(false);
      }, 0);
    } else {
      setIsMenuOpenMobile(true);
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const userRef = dbRef(db, `users/${currentUserId}`);
    onValue(userRef, (snapshot) => {
      setCurrentUserData(snapshot.val());
    });
  }, []);

  const handleAcceptRequest = async (notification) => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
  
    const requestKey = `${notification.senderId}_${currentUserId}`;
    const requestRef = dbRef(db, `requests/${requestKey}`);
  
    try {
      // Обновляем статус запроса
      await update(requestRef, { status: "accepted", pairId: requestKey });
  
      // Отправляем уведомление отправителю
      const senderNotification = {
        type: "request_accepted",
        receiverId: currentUserId,
        receiverName: currentUserData.username,
        receiverAvatar: currentUserData.avatarUrl || defaultAvatar,
        timestamp: new Date().toISOString(),
      };
  
      await push(dbRef(db, `notifications/${notification.senderId}`), senderNotification);
  
      // Удаляем уведомление с анимацией
      handleDeleteNotification(notification.id);
    } catch (error) {
      console.error("Ошибка при принятии запроса:", error);
    }
  };

  const handleDeclineRequest = async (notification) => {
    if (!currentUserId) return;
  
    const db = getDatabase();
  
    try {
      setNotifications((prev) => prev.filter((notif) => notif.id !== notification.id));
  
      await remove(dbRef(db, `requests/${notification.senderId}_${currentUserId}`));
  
      await remove(dbRef(db, `notifications/${currentUserId}/${notification.id}`));
    } catch (error) {
      console.error("Ошибка при отклонении запроса:", error);
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
  
        // Обновляем состояние так, чтобы новые уведомления появлялись сверху
        setNotifications((prevNotifications) => {
          const newNotifications = notificationsArray.filter(
            (notif) => !prevNotifications.some((prev) => prev.id === notif.id)
          );
  
          return [...newNotifications, ...prevNotifications].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
  
        // Помечаем уведомления как прочитанные сразу после их появления
        const updatedNotifications = {};
        notificationsArray.forEach((notif) => {
          updatedNotifications[notif.id] = { ...notif, isRead: true };
        });
  
        update(notificationsRef, updatedNotifications).catch((error) => {
          console.error("Ошибка при обновлении статуса уведомлений:", error);
        });
      }
    });
  
    return () => unsubscribe();
  }, [currentUserId]);

  const handleDeleteNotification = (notificationId) => {
    if (!currentUserId || !notificationId) return;
    const database = getDatabase();
  
    // Найдем элемент в DOM
    const notificationElement = document.getElementById(`notification-${notificationId}`);
    if (notificationElement) {
      notificationElement.classList.add("fade-out"); // 🔥 Добавляем анимацию
    }
  
    // ⏳ Ждем завершения анимации перед удалением из состояния
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  
      // Удаляем из Firebase
      remove(dbRef(database, `notifications/${currentUserId}/${notificationId}`))
        .catch((error) => {
          console.error("Ошибка при удалении уведомления:", error);
        });
    }, 300); // ⏳ Ждем 300 мс (длительность анимации)
  };  

  return (
    <div className="glava" style={{height: "100%"}}>
    <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
        <img style={{width: "50px", height: "45px"}} src={ttulogo} alt="" />
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
          <Link to="/" className="menu-item">
            <FiHome className="menu-icon"/>
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
            <FiUser className="menu-icon" />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <div className="menu-find-block">
          <Link to="/chats" className="menu-item">
            <FiMessageSquare className="menu-icon" />
            {isMenuOpen && <span>Сообщения</span>}
          </Link>
          <Link to="/notifications" className="menu-item">
            <FiBell className="menu-icon" style={{color: "lightgreen"}} />
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
      <div className="notifications-page" style={mainContentStyle}>
        <header className="head-line">
          <div className="header-nav-2">

            <Link className="back-button white-icon" style={{ marginLeft: "15px" }} onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </Link>

            <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>Уведомления</ul>

            <div className={`burger-menu-icon ${isMenuOpenMobile ? 'open' : ''}`} onClick={toggleMenuMobile}>
              <span className="bm-span"></span>
              <span className="bm-span"></span>
              <span className="bm-span"></span>
            </div>

            <div className={`burger-menu ${isMenuOpenMobile ? 'open' : ''}`}>
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
              <div key={notification.id} id={`notification-${notification.id}`} className="notification-card ani">
                {/* Уведомление о запросе на переписку */}
                {notification.type === "conversation_request" && (
                  <>
                    <div className="notification-header">
                      <img
                        src={notification.senderAvatar || defaultAvatar}
                        alt="Avatar"
                        className="notification-avatar clickable"
                        onClick={() => goToProfile(notification.senderId)}
                      />
                      <p className="notification-timestamp">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="notification-body">
                      <div className="notification-meta">
                        <h3 className="notification-title">
                          Новый запрос на переписку
                        </h3>
                        <button
                          className="delete-notification-button"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          &times;
                        </button>
                      </div>
                      <p className="notification-text">
                        Пользователь{' '}
                        <span
                          className="user-link"
                          onClick={() => goToProfile(notification.senderId)}
                        >
                          {notification.senderName}
                        </span>{' '}
                        хочет начать с вами диалог
                      </p>

                      <div className="notification-actions">
                        <button
                          className="accept-button"
                          onClick={() => handleAcceptRequest(notification)}
                        >
                          <span className="button-icon">✓</span>
                          Принять
                        </button>
                        <button
                          className="decline-button"
                          onClick={() => handleDeclineRequest(notification)}
                        >
                          <span className="button-icon">✕</span>
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Уведомление о принятии запроса */}
                {notification.type === "request_accepted" && (
                  <div className="notification-success">
                    <div className="notification-header">
                      <div className="notification-meta">
                        <img
                          src={notification.receiverAvatar || defaultAvatar}
                          alt="Avatar"
                          className="notification-avatar clickable"
                          onClick={() => goToProfile(notification.receiverId)}
                        />
                        <button
                          className="delete-notification-button"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          &times;
                        </button>
                      </div>
                      <div className="notification-meta">
                        <h3 className="notification-title">
                          Запрос принят
                        </h3>
                        <p className="notification-timestamp">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="notification-body">
                      <p className="notification-text">
                        <span
                          className="user-link"
                          onClick={() => goToProfile(notification.receiverId)}
                        >
                          {notification.receiverName}
                        </span>{' '}
                        принял(а) ваш запрос на переписку
                      </p>
                      <button
                        className="goto-chat-button"
                        onClick={() => navigate(`/profile/${notification.receiverId}`)}
                      >
                        Перейти в профиль
                      </button>
                    </div>
                  </div>
                )}

                {/* Уведомления других типов */}
                {['comment', 'like'].includes(notification.type) && (
                  <>
                    <div className="notification-header">
                      <div>
                        <img
                          src={notification.avatarUrl || defaultAvatar}
                          alt="Avatar"
                          className="notification-avatar clickable"
                          onClick={() => goToProfile(notification.userId)}
                        />
                        <p className="notification-timestamp">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="notification-body">
                      <div className="notification-meta">
                      <h3 className="notification-title">
                        {notification.type === 'comment'
                          ? 'Новый комментарий'
                          : 'Новый лайк'}
                      </h3>
                      <button
                          className="delete-notification-button"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          &times;
                        </button>
                        </div>
                      <p className="notification-text">
                        {notification.type === 'comment' ? (
                          <>
                            <span
                              className="user-link"
                              onClick={() => goToProfile(notification.userId)}
                            >
                              {notification.username}
                            </span>{' '}
                            оставил комментарий: "{notification.comment}"
                          </>
                        ) : (
                          <>
                            <span
                              className="user-link"
                              onClick={() => goToProfile(notification.userId)}
                            >
                              {notification.username}
                            </span>{' '}
                            оценил(а) вашу публикацию
                          </>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <div className="empty-state">
                <FiBell className="empty-icon" />
                <p>{t('dontnotifications')}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;