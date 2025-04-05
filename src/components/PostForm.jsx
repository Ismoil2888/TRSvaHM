import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, push, set } from "firebase/database";
import defaultAvatar from "../default-image.png";
import defaultImage from "../Ttulogo.jpg";
import "../App.css";
import "../PostForm.css";
import { FaChevronLeft } from "react-icons/fa";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import useTranslation from '../hooks/useTranslation';

const PostForm = () => {
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: defaultAvatar });
  const [media, setMedia] = useState(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const t = useTranslation();
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const [identificationStatus, setIdentificationStatus] = useState(null);
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
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
      marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "200px" : "80px"),
      transition: "margin 0.3s ease",
    };
  
    const currentUserHeader = {
      marginRight: isMenuOpen ? "400px" : "80px",
      marginBottom: isMenuOpen ? "11px" : "8px",
      transition: "margin 0.3s ease",
    };
  
    const HeaderDesktop = {
      margin: isMenuOpen ? "12px" : "6px 35px",
      transition: "margin 0.3s ease",
    };

   // Функция для успешных уведомлений
 const showNotification = (message) => {
  setNotificationType("success");
  setNotification(message);
  setTimeout(() => {
    setNotification("");
    setNotificationType("");
  }, 3000);
};

// Функция для ошибочных уведомлений
const showNotificationError = (message) => {
  setNotificationType("error");
  setNotification(message);
  setTimeout(() => {
    setNotification("");
    setNotificationType("");
  }, 3000);
};

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const database = getDatabase();
      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserDetails({
            username: data.username || "User",
            avatarUrl: data.avatarUrl || defaultAvatar,
          });
        }
      });

            const requestRef = dbRef(database, "requests");
            onValue(requestRef, (snapshot) => {
              const requests = snapshot.val();
              const userRequest = Object.values(requests || {}).find(
                (request) => request.email === user.email
              );
      
              if (userRequest) {
                setIdentificationStatus(
                  userRequest.status === "accepted" ? "идентифицирован" : "не идентифицирован"
                );
              } else {
                setIdentificationStatus("не идентифицирован");
              }
            });
    }
  }, []);

  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
  
    if (!description && !media) {
      showNotificationError("Пожалуйста, добавьте описание или медиафайл!");
      return;
    }
  
    setIsUploading(true);
  
    const db = getDatabase();
    const storage = getStorage();
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      showNotificationError("Вы должны войти в систему, чтобы публиковать посты!");
      setIsUploading(false);
      return;
    }
  
    const postsRef = dbRef(db, "posts");
    let mediaUrl = null;
  
    if (media) {
      const mediaRef = storageRef(storage, `posts/${media.name}-${Date.now()}`);
      await uploadBytes(mediaRef, media);
      mediaUrl = await getDownloadURL(mediaRef);
    } else {
      mediaUrl = defaultImage; // Изображение по умолчанию
    }
  
    // Данные поста с полем `status`
    const postData = {
      description,
      mediaUrl,
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
      status: "pending"
    };
    
    // const postData = {
    //   description,
    //   mediaUrl,
    //   createdAt: new Date().toISOString(),
    //   userName: userDetails.username,
    //   userAvatar: userDetails.avatarUrl,
    //   userId: currentUser.uid,
    //   status: "pending", // Статус по умолчанию: "pending"
    // };
  
    const newPostRef = push(postsRef);
    await set(newPostRef, postData);
  
    setIsUploading(false);
    setMedia(null);
    setDescription("");
    showNotification("Ваш пост отправлен на модерацию.");
    // navigate("/home");
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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Fetch user avatar
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl("./default-image.png"); // Default image
        }
      });
    }
  }, []);

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, type: 'spring', stiffness: 50 } 
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 50 },
    },
  };

  if (identificationStatus === "не идентифицирован") {
    return (
      <div className="not-identified-container">
        <div className="not-identified">
          <h2 className="not-identified-h2" data-text="T I K">T I K</h2>
          <p style={{ color: "#008cb3", textAlign: "center", fontSize: "18px", marginTop: "15px" }}>Пройдите идентификацию, чтобы выкладывать посты!</p>
          <p style={{ color: "skyblue", marginTop: "15px" }} onClick={() => navigate(-1)}>Назад</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-container">
       {notification && (
            <div className={`notification ${notificationType}`}>
        {notification}
            </div>
          )} {/* Уведомление */}
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
            <FiHome className="menu-icon"  />
            {isMenuOpen && <span className="txt">{t('main')}</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/searchpage" className="menu-item">
              <FiSearch className="menu-icon" />
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
              <FiBell className="menu-icon" style={{ color: "orange" }} />
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
      <div className="glav-container" style={mainContentStyle}>
<header>
        <div className="header-nav-2">

        <FaChevronLeft style={{ marginLeft: "10px", color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Публикация</ul>

        <div className={`burger-menu-icon ${isMenuOpenMobile ? 'open' : ''}`} onClick={toggleMenuMobile}>          
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className={`burger-menu ${isMenuOpenMobile ? 'open' : ''}`}>         
        <ul>
           <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{color: "red"}} /> Главная</Link></li>
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

      <div className="postform-header">
      <div>
        <FaChevronLeft style={{position: "absolute", left: "0", top: "0", color: "white", fontSize: "25px"}} onClick={() => navigate(-1)} />
      </div>
      </div>
      <div className="post-form-container">
        <form onSubmit={handlePostSubmit} className="post-form">
          <h2>Создать пост</h2>
          <div className="form-group">
            <label htmlFor="media">Медиа (изображение или видео):</label>
            <input type="file" id="media" accept="image/*,video/*" onChange={handleMediaChange} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Описание:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание поста"
              rows="4"
            />
          </div>
          <button type="submit" disabled={isUploading} className="submit-btn">
            {isUploading ? "Публикация..." : "Опубликовать"}
          </button>
        </form>
      </div>

<div style={{width: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <motion.nav 
          variants={navbarVariants} 
          initial="hidden" 
          animate="visible" 
          className="footer-nav"
        >
          <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
          <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
          <Link to="/post"><FaPlusCircle className="footer-icon active-icon" /></Link>
          <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
          <Link to="/myprofile">
            <img src={userAvatarUrl} alt="" className="footer-avatar skeleton-media-avatars" />
          </Link>
        </motion.nav> 
      </div>
      </div>
    </div>
  );
};

export default PostForm;