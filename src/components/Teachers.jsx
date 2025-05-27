import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getDatabase, ref as dbRef, set, onValue, push, update, remove, get } from "firebase/database";
import { auth } from "../firebase";
import "../App.css";
import "../teachers.css";
import logoTip from "../basic-logo.png";
import defaultTeacherImg from "../teacher.svg";
import { FaCommentDots } from "react-icons/fa";
import basiclogo from "../basic-logo.png";
import { FaPlusCircle, FaUserSecret, FaInfo } from "react-icons/fa";
import { motion } from "framer-motion";
import { BsSendFill } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { GoKebabHorizontal } from "react-icons/go";
import anonymAvatar from "../anonym2.jpg";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import useTranslation from "../hooks/useTranslation";
import { LazyLoadImage } from "react-lazy-load-image-component";
import forbiddenNames from "./forbiddenNames";

const Teachers = () => {
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [identificationStatus, setIdentificationStatus] = useState("");
  const [showIdentifyPrompt, setShowIdentifyPrompt] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("Системахои Автоматикунонидашудаи Идоракуни");
  const [activeDescription, setActiveDescription] = useState(null);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const [commentModal, setCommentModal] = useState({ isOpen: false, teacherId: null });
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState('positive');
  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslation();
  const database = getDatabase();
  const [userRole, setUserRole] = useState('');
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    const savedState = localStorage.getItem("isMenuOpen");
    return savedState ? JSON.parse(savedState) : true;
  });
  const navigate = useNavigate();
  const location = useLocation();
  // состояние для подсветки / скролла к нужному преподавателю
  const [highlightedId, setHighlightedId] = useState(null);

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
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

  // Массив кафедр для выпадающего списка
  const departments = [
    "Системахои Автоматикунонидашудаи Идоракуни",
    "Шабакахои Алока Ва Системахои Комутатсиони",
    "Технологияхои Иттилооти Ва Хифзи Маълумот",
    "Автоматонии Равандхои Технологи Ва Истехсолот",
    "Информатика Ва Техникаи Хисоббарор",
  ];

  useEffect(() => {
    localStorage.setItem("isMenuOpen", JSON.stringify(isMenuOpen));
  }, [isMenuOpen]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 700;
      setIsMobile(mobile);
      if (mobile) {
        setIsMenuOpen(false);
      } else {
        const savedState = localStorage.getItem("isMenuOpen");
        setIsMenuOpen(savedState ? JSON.parse(savedState) : true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleMenuDesktop = () => {
    setIsMenuOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("isMenuOpen", JSON.stringify(newState));
      return newState;
    });
  };

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : isMenuOpen ? "340px" : "80px",
    transition: "margin 0.3s ease",
  };

  const currentUserHeader = {
    marginRight: isMenuOpen ? "400px" : "80px",
    marginBottom: isMenuOpen ? "0px" : "0px",
    transition: "margin 0.3s ease",
  };

  const HeaderDesktop = {
    margin: isMenuOpen ? "12px" : "6px 35px",
    transition: "margin 0.3s ease",
  };

  useEffect(() => {
    const database = getDatabase();
    const teachersRef = dbRef(database, "teachers");

    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTeachers = Object.keys(data).map((id) => ({ id, ...data[id] }));
        loadedTeachers.forEach((teacher) => {
          const commentsRef = dbRef(database, `comments/${teacher.id}`);
          onValue(commentsRef, (commentSnapshot) => {
            const commentsData = commentSnapshot.val();
            teacher.commentCount = commentsData ? Object.keys(commentsData).length : 0;
            setTeachers([...loadedTeachers]);
          });
        });
        setTeachers(loadedTeachers);
        setFilteredTeachers(loadedTeachers);
      } else {
        setTeachers([]);
        setFilteredTeachers([]);
      }
    });

    const user = auth.currentUser;
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
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
        setIdentificationStatus(userData.identificationStatus || "");
      });
    }
  }, []);

  useEffect(() => {
    const teacherName = location.state?.teacherName?.toLowerCase();
      // если нет команды или список ещё пуст — ничего не делаем
   if (!teacherName || teachers.length === 0) return;

    // когда teachers уже есть — найдём совпадение по имени или фамилии
    const match = teachers.find(t =>
      t.name?.toLowerCase() === teacherName ||
      t.surname?.toLowerCase() === teacherName
    );
    if (match) {
      setHighlightedId(match.id);
      // setFilteredTeachers([match]);      // отфильтруем список (только его)
      // setHighlightedId(match.id);       // запомним id для подсветки
          // опционально: очищаем state, чтобы не «подхватить» эту же команду снова
     navigate(location.pathname, { replace: true, state: {} });
    } else {
      // если не нашли — можно показать уведомление
      showNotificationError(`Преподаватель ${teacherName} не найден.`);
    }
  }, [teachers, location.state, navigate, location.pathname]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const searchFiltered = teachers.filter((teacher) => {
      // если name или surname не заданы, будем считать их пустой строкой
      const name = teacher.name || "";
      return (
        name.toLowerCase().includes(query)
      );
    });

    setFilteredTeachers(searchFiltered);
  };

  const openCommentModal = (teacherId) => {
    setCommentModal({ isOpen: true, teacherId });
    const database = getDatabase();
    const commentsRef = dbRef(database, `comments/${teacherId}`);
    // Внутри openCommentModal
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedComments = Object.keys(data).map(id => ({ id, ...data[id] }));
        const positive = loadedComments.filter(c => c.type === 'positive').length;
        const negative = loadedComments.filter(c => c.type === 'negative').length;
        setPositiveCount(positive);
        setNegativeCount(negative);
        setComments(loadedComments);

        // Обновляем общий счетчик для карточки
        const teacherIndex = teachers.findIndex(t => t.id === teacherId);
        const updatedTeachers = [...teachers];
        updatedTeachers[teacherIndex].commentCount = positive + negative;
        setTeachers(updatedTeachers);
      } else {
        setComments([]);
        setPositiveCount(0);
        setNegativeCount(0);
      }
    });
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, teacherId: null });
    setComments([]);
    setActionMenuId(null);
    setEditingCommentId(null);
    setNewComment("");
  };

  const handleCommentSubmit = (isAnonymous = false) => {
    if (identificationStatus !== "accepted") {
      setShowIdentifyPrompt(true);
      return;
    }
    const text = newComment.trim();
    if (!text) return;

    const foundBad = forbiddenNames.some(
      bad => text.toLowerCase().includes(bad.toLowerCase())
    );
    if (foundBad) {
      showNotificationError("Нельзя писать такие комментарии");
      return;
    }

    const database = getDatabase();
    const commentRef = dbRef(database, `comments/${commentModal.teacherId}`);
    if (editingCommentId) {
      update(dbRef(database, `comments/${commentModal.teacherId}/${editingCommentId}`), {
        comment: newComment,
        timestamp: new Date().toLocaleString(),
      });
      setEditingCommentId(null);
    } else {
      const newCommentRef = push(commentRef);
      update(newCommentRef, {
        type: activeTab,
        avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
        username: isAnonymous ? "Анонимно" : userDetails.username,
        userId: isAnonymous ? null : auth.currentUser?.uid,
        anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
        comment: newComment,
        timestamp: new Date().toLocaleString(),
      });
    }
    setNewComment("");
  };

  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setNewComment(commentText);
    setActionMenuId(null);
  };

  const handleDeleteComment = (commentId) => {
    const database = getDatabase();
    remove(dbRef(database, `comments/${commentModal.teacherId}/${commentId}`));
    setActionMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
      const isActionButton = event.target.closest(".action-menu button");
      if (!isInsideMenu && !isActionButton) {
        setActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleActionMenu = (commentId) => {
    setActionMenuId((prev) => (prev === commentId ? null : commentId));
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

  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, type: "spring", stiffness: 50 },
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: "spring", stiffness: 50 },
    },
  };

  // Фильтрация преподавателей по выбранной кафедре или поиск по всем
  // После объявления highlightedId и filteredTeachers
const displayedTeachers = (() => {
  // Если есть highlightedId — значит мы из голосового помощника
  if (highlightedId) {
    // покажем ровно тот преподаватель, которого просили
    return filteredTeachers;
  }
  // если в строке поиска что-то есть — ищем по ней
  if (searchQuery) {
    return filteredTeachers;
  }
  // иначе — фильтруем по активной кафедре
  return filteredTeachers.filter((teacher) => 
    teacher.cathedra === activeDepartment
  );
})();

  // const displayedTeachers = searchQuery
  //   ? filteredTeachers
  //   : filteredTeachers.filter((teacher) => teacher.cathedra === activeDepartment);

  return (
    <div className="glava">
      {notification && (
        <div className={`notification ${notificationType}`}>
          {notification}
        </div>
      )}
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
              <FiSearch className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('findstudents')}</span>}
            </Link>
            <Link to="/teachers" className="menu-item">
              <FiUserCheck className="menu-icon" style={{ background: "linear-gradient(60deg, rgb(219, 98, 98), rgba(0, 128, 107, 0.575), rgba(108, 108, 216, 0.66))", color: "white" }} />
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
      <div className="glav-container" style={mainContentStyle}>
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
            <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>
              {t("teachcollective")}
            </ul>
            <div className={`burger-menu-icon ${isMenuOpenMobile ? "open" : ""}`} onClick={toggleMenuMobile}>
              <span className="bm-span"></span>
              <span className="bm-span"></span>
              <span className="bm-span"></span>
            </div>
            <div className={`burger-menu ${isMenuOpenMobile ? "open" : ""}`}>
              <ul>
                <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
                <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
                <li>
                  <Link to="/teachers">
                    <FontAwesomeIcon icon={faChalkboardTeacher} style={{ color: "red" }} /> Преподаватели
                  </Link>
                </li>
                <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
                <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
                <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
                <li><Link to="/jarvisintropage"><FontAwesomeIcon icon={faUserCog} /> {t('voiceassistant')}</Link></li>
              </ul>
            </div>
          </div>
        </header>
        <section className="tch-hero">
          <div className="faculty-image">
            <img style={{ height: "240px", marginTop: "70px" }} width="255px" src={logoTip} alt="Фото преподавателей" />
          </div>
          <h1>{t("teachcollective")}</h1>
        </section>
        <motion.nav className="dropdown-search" variants={navbarVariants} initial="hidden" animate="visible">
          <div className="department-dropdown txt" style={{ margin: "20px 0", textAlign: "center" }}>
            <label htmlFor="department-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
              {t("selectcathedra")}:
            </label>
            <select
  id="department-select"
  value={activeDepartment}
  onChange={(e) => {
    const dept = e.target.value;
    setActiveDepartment(dept);
    setSearchQuery("");         // сброс текстового поиска
    setHighlightedId(null);     // сброс «голосового» режима
    setFilteredTeachers(
      teachers.filter((t) => t.cathedra === dept)
    );
  }}
  style={{ padding: "7px", borderRadius: "15px", border: "1px solid #ccc", width: "350px" }}
>
  {departments.map((dept, idx) => (
    <option key={idx} value={dept}>
      {dept}
    </option>
  ))}
</select>
            {/* <select
              id="department-select"
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
              style={{ padding: "10px", borderRadius: "15px", border: "1px solid #ccc", width: "350px" }}
            >
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select> */}
          </div>
          <section className="teachers-section">
            <div className="search-bar">
              <input
                type="search"
                placeholder="Поиск преподавателей факультета..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div className="tch-container">
              {displayedTeachers.length === 0 ? (
                <p>Найдите нужного вам преподавателя.</p>
              ) : (
                displayedTeachers.map((teacher) => (
                  <div
                    className={`teacher-card ${teacher.id === highlightedId ? "highlighted" : ""}`}
                    key={teacher.id}
                    ref={el => {
                      // если это наш преподаватель — проскроллим к нему сразу
                      if (teacher.id === highlightedId && el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                  >
                    <LazyLoadImage
                      src={teacher.photo || defaultTeacherImg}
                      alt={`${teacher.name} ${teacher.surname}`}
                      className="skeleton-media-avatars"
                    />
                    <h4>{`${teacher.name}`}</h4>
                    <p>
                      <strong>{t('subject')}:</strong> {teacher.subject}
                    </p>
                    <p>
                      <strong>{t('rank')}:</strong> {teacher.runk}
                    </p>
                    <p>
                      <strong>{t('cathedra')}:</strong> {teacher.cathedra}
                    </p>
                    <div className="comment-icon-and-count">
                      <span style={{ color: "grey", marginRight: "15px" }}>Отзывы</span><FaCommentDots className="comment-icon" onClick={() => openCommentModal(teacher.id)} />
                      <span className="comment-count">{teacher.commentCount || 0}</span>
                    </div>
                    <div className="gototeachprofile" onClick={() => goToProfile(teacher.id)}>
                      Перейти в профиль
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </motion.nav>
        {commentModal.isOpen && (
          <div className="comment-modal-overlay">
            <div className="comment-modal">
              <div className="modal-header">
                <h3 className="txt">Комментарии</h3>
                <button className="close-modal" onClick={closeCommentModal}>
                  &times;
                </button>
              </div>
              <div className="tch-tabs">
                <button
                  className={activeTab === 'positive' ? 'active' : ''}
                  onClick={() => setActiveTab('positive')}
                >
                  Положительные ({positiveCount})
                </button>
                <button
                  className={activeTab === 'negative' ? 'active' : ''}
                  onClick={() => setActiveTab('negative')}
                >
                  Отрицательные ({negativeCount})
                </button>
              </div>
              <div className="comments-list">
                {comments
                  .filter(comment => comment.type === activeTab)
                  .slice()
                  .reverse()
                  .map((comment) => (
                    <div className="comment" key={comment.id}>
                      <img
                        src={comment.avatarUrl || "./default-avatar.png"}
                        alt={comment.username}
                        className="comment-avatar skeleton-media-avatars"
                        onClick={() => goToProfile(comment.userId)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="comment-content">
                        <Link to={`/profile/${comment.userId}`} className="comment-username txt" style={{ cursor: "pointer" }}>
                          <p>{comment.username}</p>
                        </Link>
                        <p className="comment-text txt">{comment.comment}</p>
                        <span className="comment-timestamp">{comment.timestamp}</span>
                      </div>
                      <div ref={actionMenuRef} className="menu-icon-container">
                        {(comment.userId === auth.currentUser?.uid ||
                          comment.anonymousOwnerId === auth.currentUser?.uid) && (
                            <>
                              <GoKebabHorizontal
                                style={{ fontSize: "20px", color: "grey" }}
                                onClick={() => toggleActionMenu(comment.id)}
                                className="action-icon"
                              />
                              {actionMenuId === comment.id && (
                                <div className={`action-menu show`}>
                                  <button onClick={() => handleEditComment(comment.id, comment.comment)}>
                                    Изменить
                                  </button>
                                  <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
                                </div>
                              )}
                            </>
                          )}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="new-comment">
                <input
                  type="text"
                  placeholder="Напишите комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={() => handleCommentSubmit(false)} style={{ display: "flex", alignContent: "center", justifyContent: "center" }}>
                  {editingCommentId ? "Изменить" : "Отправить"}
                  <BsSendFill style={{ marginLeft: "10px", fontSize: "22px" }} />
                </button>
                <button onClick={() => handleCommentSubmit(true)} style={{ display: "flex", alignContent: "center", justifyContent: "center" }}>
                  {editingCommentId ? "Изменить анонимно" : "Отправить анонимно"}
                  <FaUserSecret style={{ marginLeft: "5px", fontSize: "25px" }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {showIdentifyPrompt && (
          <div className="identify-prompt-overlay">
            <div className="identify-prompt-modal">
              <p>Чтобы ставить лайки и комментарии, нужно пройти идентификацию.</p>
              <button
                style={{ color: "blue", borderBottom: "1px solid grey", borderRadius: "0" }}
                onClick={() => {
                  setShowIdentifyPrompt(false);
                  navigate("/authdetails", { state: { openForm: true } });
                }}
              >
                Пройти идентификацию
              </button>
              <button onClick={() => setShowIdentifyPrompt(false)}>Отмена</button>
            </div>
          </div>
        )}

        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.nav variants={navbarVariants} initial="hidden" animate="visible" className="footer-nav">
            <Link to="/home">
              <FontAwesomeIcon icon={faHome} className="footer-icon" />
            </Link>
            <Link to="/searchpage">
              <FontAwesomeIcon icon={faSearch} className="footer-icon active-icon" />
            </Link>
            <Link to="/about">
              <FaInfo className="footer-icon" />
            </Link>
            {(role === "teacher" || role === "dean") && <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>}
            <Link to="/library">
              <FontAwesomeIcon icon={faBook} className="footer-icon" />
            </Link>
            <Link to="/myprofile">
              <img src={userDetails.avatarUrl} alt="User Avatar" className="footer-avatar" />
            </Link>
          </motion.nav>
        </div>
      </div>
    </div>
  );
};

export default Teachers;