import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue, set, push, update, remove } from "firebase/database";
import { auth } from "../firebase";
import { FaTimes, FaCommentDots } from "react-icons/fa";
import bookIcon from '../book-icon.png';
import "../App.css";
import "../library.css";
import basiclogo from "../basic-logo.png";
import { GoKebabHorizontal } from "react-icons/go";
import { motion } from 'framer-motion';
import { FaPlusCircle, FaInfo } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import defaultAvatar from '../default-image.png';
import anonymAvatar from '../anonym2.jpg';
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import useTranslation from '../hooks/useTranslation';
import forbiddenNames from "./forbiddenNames";

const Library = ({ userId }) => {
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [videoLessons, setVideoLessons] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  // const [commentModal, setCommentModal] = useState({ isOpen: false, bookId: null });
  const [commentModal, setCommentModal] = useState({ isOpen: false, contentId: null, type: null, authorId: null });
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);
  const t = useTranslation();
  const [userRole, setUserRole] = useState('');
  const [role, setRole] = useState("");
  const database = getDatabase();
  const navigate = useNavigate();
  const [identificationStatus, setIdentificationStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    const savedState = localStorage.getItem('isMenuOpen');
    return savedState ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('isMenuOpen', JSON.stringify(isMenuOpen));
  }, [isMenuOpen]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 700;
      setIsMobile(mobile);
      if (mobile) {
        setIsMenuOpen(false);
      } else {
        const savedState = localStorage.getItem('isMenuOpen');
        setIsMenuOpen(savedState ? JSON.parse(savedState) : true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenuDesktop = () => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isMenuOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "340px" : "98px"),
    transition: "margin 0.3s ease",
  };

  const currentUserHeader = {
    marginRight: isMenuOpen ? "400px" : "116px",
    marginBottom: isMenuOpen ? "0px" : "0px",
    transition: "margin 0.3s ease",
  };

  const HeaderDesktop = {
    margin: isMenuOpen ? "12px" : "6px 17px",
    transition: "margin 0.3s ease",
  };

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

  // 2. Получение видеоуроков
useEffect(() => {
  const ref = dbRef(database, "videoLessons");
  onValue(ref, (snapshot) => {
    const data = snapshot.val() || {};
    const loaded = Object.entries(data).map(([id, video]) => ({
      id,
      // Если в вашей БД имя автора лежит в video.author или video.uploaderName:
      author: video.author || video.uploaderName || "Неизвестный",
      authorId: video.authorId || video.uploaderId || null,
      cathedra: video.cathedra || "",
      title: video.title,
      description: video.description,
      url: video.url,
      timestamp: video.timestamp,
      commentCount: 0,
      publishedDate: video.timestamp
        ? new Date(video.timestamp).toLocaleDateString()
        : "—",
      // при необходимости — cathedra: video.cathedra || ""
    }));

    // считаем комментарии
    loaded.forEach(v => {
      onValue(dbRef(database, `comments/${v.id}`), snap => {
        const com = snap.val();
        v.commentCount = com ? Object.keys(com).length : 0;
        setVideoLessons([...loaded]);
      });
    });

    setVideoLessons(loaded);
    setFilteredVideos(loaded);
  }, { onlyOnce: true });
}, [database]);

  // useEffect(() => {
  //   const ref = dbRef(database, "videoLessons");
  //   onValue(ref, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const loaded = Object.keys(data).map(id => ({ id, ...data[id], commentCount: 0 }));

  //       // Загружаем количество комментариев
  //       loaded.forEach(video => {
  //         const commentsRef = dbRef(database, `comments/${video.id}`);
  //         onValue(commentsRef, (snapshot) => {
  //           const commentsData = snapshot.val();
  //           video.commentCount = commentsData ? Object.keys(commentsData).length : 0;
  //           setVideoLessons([...loaded]);
  //         });
  //       });
  //     }
  //   });
  // }, []);

  // 3. Фильтрация по кафедре

  // Массив кафедр для вкладок
  const departments = [
    "Системахои Автоматикунонидашудаи Идоракуни",
    "Шабакахои Алока Ва Системахои Комутатсиони",
    "Технологияхои Иттилооти Ва Хифзи Маълумот",
    "Автоматонии Равандхои Технологи Ва Истехсолот",
    "Информатика Ва Техникаи Хисоббарор"
  ];
  const [activeDepartment, setActiveDepartment] = useState(departments[0]);
  // const filteredVideos = videoLessons.filter(v => v.cathedra === activeDepartment);

  //   // Загрузка пользовательских данных и статуса идентификации
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const requestRef = dbRef(database, "requests");
      onValue(requestRef, (snapshot) => {
        const requests = snapshot.val();
        const userRequest = Object.values(requests || {}).find(
          (request) => request.email === user.email
        );

        if (userRequest) {
          setIdentificationStatus(
            userRequest.status === "accepted" ? t('ident') : t('notident')
          );
        } else {
          setIdentificationStatus(t('notident'));
        }
      });

      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl(defaultAvatar);
        }
      });
    }
  }, [database]);

  // Функция загрузки книг
  useEffect(() => {
    const fetchBooks = () => {
      const teachersRef = dbRef(database, "teachers");
      const booksRef = dbRef(database, "books");
      const loadedBooks = [];

      // Загрузка книг от преподавателей
      onValue(teachersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.entries(data).forEach(([teacherId, teacherInfo]) => {
            const teacherBooks = teacherInfo.books;
            const teacherName = `${teacherInfo.name} ${teacherInfo.surname}`;
            if (teacherBooks) {
              Object.entries(teacherBooks).forEach(([bookId, book]) => {
                loadedBooks.push({
                  id: bookId,
                  title: book.title,
                  description: book.description,
                  fileURL: book.fileURL,
                  teacherId,
                  cathedra: teacherInfo.cathedra || "",
                  author: book.author || teacherName,
                  publishedDate: book.timestamp
                    ? new Date(book.timestamp).toLocaleDateString()
                    : "—",
                  commentCount: 0,
                });
              });
            }
          });
        }
      }, { onlyOnce: true });

      // Загрузка книг из общего списка
      onValue(booksRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.entries(data).forEach(([bookId, book]) => {
            loadedBooks.push({
              id: bookId,
              title: book.title,
              description: book.description,
              fileURL: book.fileURL,
              cathedra: book.cathedra || "",
              author: book.author || "Неизвестный",
              publishedDate: book.timestamp
                ? new Date(book.timestamp).toLocaleDateString()
                : "—",
              commentCount: 0,
            });
          });
        }

        // Подсчёт комментариев
        loadedBooks.forEach((book) => {
          const commentsRef = dbRef(database, `comments/${book.id}`);
          onValue(commentsRef, (commentSnap) => {
            const commentsData = commentSnap.val();
            book.commentCount = commentsData ? Object.keys(commentsData).length : 0;
            // обновляем состояние после каждого изменения числа комментариев
            setBooks([...loadedBooks]);
          });
        });

        setFilteredBooks(loadedBooks);
      }, { onlyOnce: true });
    };

    const user = auth.currentUser;
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserDetails({
            username: data.username || "User",
            avatarUrl: data.avatarUrl || defaultAvatar,
          });
          setRole(data.role || "");
          setUserRole(data.role || "");
        }
      }, { onlyOnce: true });
    }

    fetchBooks();
  }, [database]);

  // Функция загрузки книг
  // useEffect(() => {
  //   const fetchBooks = () => {
  //     const teachersRef = dbRef(database, "teachers");
  //     const booksRef = dbRef(database, "books");
  //     const loadedBooks = [];

  //     // Загрузка книг от преподавателей (сохраняем кафедру из данных учителя)
  //     onValue(teachersRef, (snapshot) => {
  //       const data = snapshot.val();
  //       if (data) {
  //         Object.keys(data).forEach((teacherId) => {
  //           const teacherBooks = data[teacherId].books;
  //           if (teacherBooks) {
  //             Object.keys(teacherBooks).forEach((bookId) => {
  //               loadedBooks.push({
  //                 id: bookId,
  //                 ...teacherBooks[bookId],
  //                 teacherId,
  //                 cathedra: data[teacherId].cathedra || "",
  //                 publishedDate: new Date().toLocaleDateString(),
  //                 commentCount: 0,
  //               });
  //             });
  //           }
  //         });
  //       }
  //     });

  //     // Загрузка книг из общего списка (если есть, и если они содержат поле "cathedra")
  //     onValue(booksRef, (snapshot) => {
  //       const data = snapshot.val();
  //       if (data) {
  //         Object.keys(data).forEach((bookId) => {
  //           loadedBooks.push({
  //             id: bookId,
  //             ...data[bookId],
  //             cathedra: data[bookId].cathedra || "",
  //             publishedDate: new Date().toLocaleDateString(),
  //             commentCount: 0,
  //           });
  //         });
  //       }

  //       // Подсчет количества комментариев для каждой книги
  //       loadedBooks.forEach((book) => {
  //         const commentsRef = dbRef(database, `comments/${book.id}`);
  //         onValue(commentsRef, (commentSnapshot) => {
  //           const commentsData = commentSnapshot.val();
  //           book.commentCount = commentsData ? Object.keys(commentsData).length : 0;
  //           setBooks([...loadedBooks]);
  //         });
  //       });

  //       setFilteredBooks(loadedBooks);
  //     });
  //   };

  //   const user = auth.currentUser;
  //   if (user) {
  //     const userRef = dbRef(database, `users/${user.uid}`);
  //     onValue(userRef, (snapshot) => {
  //       const data = snapshot.val();
  //       if (data) {
  //         setUserDetails({
  //           username: data.username || "User",
  //           avatarUrl: data.avatarUrl || defaultAvatar,
  //         });
  //         setRole(data.role || "");
  //       }
  //     });

  //     onValue(userRef, (snapshot) => {
  //       const userData = snapshot.val();
  //       // Предполагается, что роль хранится в поле role
  //       setUserRole(userData?.role || '');
  //     });
  //   }

  //   fetchBooks();
  // }, [database]);

  const localStorageKey = `searchHistory_${userId}`;

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    setSearchHistory(savedHistory);
  }, [localStorageKey]);

  const saveHistoryToLocalStorage = (history) => {
    localStorage.setItem(localStorageKey, JSON.stringify(history));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (activeTab === "books") {
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else if (activeTab === "videos") {
      const filtered = videoLessons.filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBooks(books);
  };

  const addToHistory = (bookTitle) => {
    if (!searchHistory.includes(bookTitle)) {
      const newHistory = [...searchHistory, bookTitle];
      setSearchHistory(newHistory);
      saveHistoryToLocalStorage(newHistory);
    }
  };

  const removeFromHistory = (bookTitle) => {
    const newHistory = searchHistory.filter((title) => title !== bookTitle);
    setSearchHistory(newHistory);
    saveHistoryToLocalStorage(newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    saveHistoryToLocalStorage([]);
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    addToHistory(book.title);
  };

  const closeBookModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  const handleHistoryClick = (title) => {
    setSearchQuery(title);
    handleSearch(title);
    setIsSearchFocused(false);
  };

const openCommentModal = (item, contentType) => {
  // item — это объект книги или видео
  const authorId = contentType === "book"
    ? item.teacherId
    : item.authorId;

    console.log("Opening comment modal for type:", contentType);

  setCommentModal({
    isOpen: true,
    contentId: item.id,
    type: contentType,    // "book" или "video"
    authorId
  });

  // Читаем комментарии по новому contentId
  const commentsRef = dbRef(database, `comments/${item.id}`);
  onValue(commentsRef, snapshot => {
    const data = snapshot.val() || {};
    const loaded = Object.keys(data).map(id => ({ id, ...data[id] }));
    setComments(loaded);
  });
};

  // const openCommentModal = (bookId) => {
  //   setCommentModal({ isOpen: true, bookId });

  //   const commentsRef = dbRef(database, `comments/${bookId}`);
  //   onValue(commentsRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
  //       setComments(loadedComments);
  //     } else {
  //       setComments([]);
  //     }
  //   });
  // };

const closeCommentModal = () => {
  setCommentModal({
    isOpen: false,
    contentId: null,
    type: null,
    authorId: null
  });
  setComments([]);
  setActionMenuId(null);
  setEditingCommentId(null);
  setNewComment("");
};

const handleCommentSubmit = async (isAnonymous = false) => {
  const text = newComment.trim();
  if (!text) return;

  // Фильтр запрещённых слов
  const foundBad = forbiddenNames.some(bad =>
    text.toLowerCase().includes(bad.toLowerCase())
  );
  if (foundBad) {
    showNotificationError("Нельзя писать такие комментарии");
    return;
  }

  // Достаем всё из состояния
  const { contentId, authorId, type } = commentModal;
  const commentRef = dbRef(database, `comments/${contentId}`);

  if (editingCommentId) {
    // Редактирование
    await update(
      dbRef(database, `comments/${contentId}/${editingCommentId}`),
      {
        comment: text,
        timestamp: new Date().toLocaleString(),
      }
    );
    setEditingCommentId(null);
  } else {
    // Новый комментарий
    const newCommentRef = push(commentRef);
    await update(newCommentRef, {
      avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
      username: isAnonymous ? "Анонимно" : userDetails.username,
      userId: isAnonymous ? null : auth.currentUser.uid,
      anonymousOwnerId: isAnonymous ? auth.currentUser.uid : null,
      comment: text,
      timestamp: new Date().toLocaleString(),
    });

    // Уведомление автору
    if (authorId && authorId !== auth.currentUser.uid) {
const notif = {
  type: commentModal.type === "book" ? "book_comment" : "video_comment", // Добавляем тип
  contentId,
  userId: auth.currentUser.uid,
  username: userDetails.username,
  comment: text,
  timestamp: new Date().toISOString(),
};
console.log("Sending notification:", JSON.stringify(notif, null, 2));
    const notificationRef = dbRef(database, `notifications/${authorId}/${Date.now()}`);
await set(notificationRef, notif)
  .then(() => console.log("Уведомление успешно отправлено"))
  .catch((error) => {
    console.error("Ошибка отправки уведомления:", error);
    showNotificationError("Не удалось отправить уведомление");
  });
    }
  }

  setNewComment("");
};

  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setNewComment(commentText);
    setActionMenuId(null);
  };

const handleDeleteComment = (commentId) => {
  const { contentId } = commentModal;             // ← используем contentId
  remove(dbRef(database, `comments/${contentId}/${commentId}`))
    .then(() => {
      // Убираем из локального стейта
      setComments(prev => prev.filter(c => c.id !== commentId));
      setActionMenuId(null);
    })
    .catch(err => {
      console.error("Ошибка при удалении комментария:", err);
      showNotificationError("Не удалось удалить комментарий");
    });
};

  const toggleActionMenu = (commentId) => {
    setActionMenuId((prev) => (prev === commentId ? null : commentId));
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

  // Фильтрация книг по выбранной кафедре
  const displayedBooks = searchQuery
    ? filteredBooks
    : filteredBooks.filter(book => book.cathedra === activeDepartment);

  const displayedVideos = searchQuery
    ? filteredVideos
    : videoLessons.filter(v => v.cathedra === activeDepartment);

  if (identificationStatus === t('notident')) {
    return (
      <div className="not-identified-container">
        <div className="not-identified">
          <h2 className="not-identified-h2" data-text="T I K">T I K</h2>
          <p style={{ color: "#008cb3", textAlign: "center", fontSize: "18px", marginTop: "15px" }}>Пройдите идентификацию, чтобы пользоваться библиотекой!</p>
          <p style={{ color: "skyblue", marginTop: "15px" }} onClick={() => navigate(-1)}>Назад</p>
        </div>
      </div>
    );
  }

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
              <FiUserCheck className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('teachers')}</span>}
            </Link>
            <Link to="/library" className="menu-item">
              <FiBookOpen className="menu-icon" style={{ background: "linear-gradient(60deg, rgb(219, 98, 98), rgba(0, 128, 107, 0.575), rgba(108, 108, 216, 0.66))", color: "white" }} />
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
        <p className="back-text">{t("electroniclibrary")}</p>
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
            <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>{t('library')}</ul>
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
                <li><Link to="/library"><FontAwesomeIcon icon={faBook} style={{ color: "red" }} /> Библиотека</Link></li>
                <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
                <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
              </ul>
            </div>
          </div>
        </header>

        <motion.nav variants={navbarVariants} initial="hidden" animate="visible">
          <div className="library-main">
            <section className="library-header">
              <h1 className="txt">{t("facultylibrary")}</h1>
              <div className="search-filter">
                <input
                  type="search"
                  id="search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                    setIsSearchFocused(false);
                  }}
                  placeholder="Поиск книг факультета..."
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                {searchQuery && (
                  <FaTimes className="clear-search-icon" onClick={clearSearch} />
                )}
                {isSearchFocused && searchHistory.length > 0 && !searchQuery && (
                  <div className="search-history">
                    <h3>Недавнее</h3>
                    <button className="clear-all-btn" onClick={clearHistory}>Очистить все</button>
                    <ul>
                      {searchHistory.map((title, index) => (
                        <li
                          key={index}
                          className="search-history-item"
                          onClick={() => handleHistoryClick(title)}
                        >
                          <span>{title}</span>
                          <FaTimes className="remove-history-icon" onClick={() => removeFromHistory(title)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="department-dropdown txt" style={{ margin: "20px 0", textAlign: "center" }}>
                <label htmlFor="department-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
                  {t("selectcathedra")}:
                </label>
                <select
                  id="department-select"
                  value={activeDepartment}
                  onChange={(e) => setActiveDepartment(e.target.value)}
                  style={{ padding: "10px", borderRadius: "15px", border: "1px solid #ccc" }}
                >
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="tabs">
                <button onClick={() => setActiveTab("books")} className={activeTab === "books" ? "active" : ""}>{t("books")}</button>
                <button onClick={() => setActiveTab("videos")} className={activeTab === "videos" ? "active" : ""}>{t("videolessons")}</button>
              </div>
            </section>



            {activeTab === "books" ? (
              <section className="book-grid">
                {displayedBooks.length > 0 ? (
                  displayedBooks.map((book, index) => (
                    <div key={index} className="book-card" onClick={() => openBookModal(book)}>
                      <img src={bookIcon} alt="Book Icon" className="book-icon" />
                      <div className="book-info">
                        <h4>{book.title}</h4>
                        <p style={{ color: "gray" }}>{book.description}</p><hr />
                        <p className="published-date">Автор: {book.author}</p>
                        <p className="published-date">Опубликовано: {book.publishedDate}</p>
                      </div>
                      <div className="book-actions">
                        <div className="comment-icon-and-count">
                          <FaCommentDots className="comment-icon"
                           onClick={e => { e.stopPropagation(); openCommentModal(book, "book"); }}
                          />
                          <span className="comment-count">{book.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="notfound-text" style={{ color: "yellow", fontSize: "15px" }}>Найдите нужную вам книгу.</p>
                )}
              </section>
            ) : (
              <section className="video-grid">
                {displayedVideos.map(video => (
                  <div key={video.id} className="video-card">
                    <video src={video.url} controls width="100%" />
                    <h4>{video.title}</h4>
                    <p>{video.description}</p>
                    <small>Автор: {video.author}</small><br />
                    <small>Опубликовано: {video.publishedDate}</small>  {/* ← сюда */}
                    <div className="book-actions">
                      <div className="comment-icon-and-count">
                        <FaCommentDots
                          className="comment-icon"
                          onClick={() => openCommentModal(video, "video")}
                        />
                        <span className="comment-count">{video.commentCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        </motion.nav>

        {commentModal.isOpen && (
          <div className="comment-modal-overlay">
            <div className="comment-modal txt">
              <div className="modal-header">
                <h3>Комментарии</h3>
                <button className="close-modal" onClick={closeCommentModal}>
                  &times;
                </button>
              </div>
              <div className="comments-list">
                {comments.slice().reverse().map((comment) => (
                  <div className="comment" key={comment.id}>
                    <img
                      src={comment.avatarUrl || defaultAvatar}
                      alt={comment.username}
                      onClick={() => goToProfile(comment.userId)}
                      className="comment-avatar skeleton-media-avatars"
                    />
                    <div className="comment-content">
                      <p className="comment-username" onClick={() => goToProfile(comment.userId)}>{comment.username}</p>
                      <p className="comment-text">{comment.comment}</p>
                      <span className="comment-timestamp">{comment.timestamp}</span>
                    </div>
                    <div ref={actionMenuRef} className="menu-icon-container">
                      {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
                        <>
                          <GoKebabHorizontal
                            style={{ fontSize: "20px", color: "grey" }}
                            onClick={() => toggleActionMenu(comment.id)}
                            className="action-icon"
                          />
                          {actionMenuId === comment.id && (
                            <div className={`action-menu show`}>
                              <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
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
                <button onClick={() => handleCommentSubmit(false)}>Отправить</button>
                <button onClick={() => handleCommentSubmit(true)}>Отправить анонимно</button>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedBook && (
          <div className="modal-book">
            <div className="modal-content-book">
              <h3>{selectedBook.title}</h3>
              <p>{selectedBook.description}</p>
              <div className="modal-book-buttons">
                <a href={selectedBook.fileURL} target="_blank" rel="noopener noreferrer">
                  <button>Открыть</button>
                </a>
                <a href={selectedBook.fileURL} download>
                  <button>Скачать</button>
                </a>
                <button onClick={closeBookModal}>Закрыть</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.nav variants={navbarVariants} initial="hidden" animate="visible" className="footer-nav">
            <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
            <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
            <Link to="/about"><FaInfo className="footer-icon" /></Link>
            {(role === "teacher" || role === "dean") && <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>}
            <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon active-icon" /></Link>
            <Link to="/myprofile">
              <img src={userDetails.avatarUrl} alt="" className="footer-avatar skeleton-media-avatars" />
            </Link>
          </motion.nav>
        </div>
      </div>
    </div>
  );
};

export default Library;