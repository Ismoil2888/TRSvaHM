//упрощенка
// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, push, update, remove } from "firebase/database";
// import { auth } from "../firebase";
// import "../App.css";
// import "../teachers.css";
// import logoTip from "../basic-logo.png"; 
// import defaultTeacherImg from "../teacher.png";
// import { FaCommentDots } from "react-icons/fa";
// import basiclogo from "../basic-logo.png";
// import { FaPlusCircle, FaUserSecret } from "react-icons/fa";
// import { motion } from 'framer-motion';
// import { BsSendFill } from "react-icons/bs";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { GoKebabHorizontal } from "react-icons/go";
// import anonymAvatar from '../anonym2.jpg';

// const Teachers = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeDescription, setActiveDescription] = useState(null);
//   const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
//   const [commentModal, setCommentModal] = useState({ isOpen: false, teacherId: null });
//   const [newComment, setNewComment] = useState("");
//   const [comments, setComments] = useState([]);
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [actionMenuId, setActionMenuId] = useState(null);
//   const actionMenuRef = useRef(null); 
// const navigate = useNavigate();
// const goToProfile = (userId) => {
//   navigate(`/profile/${userId}`);
// };

//   useEffect(() => {
//     const database = getDatabase();
//     const teachersRef = dbRef(database, "teachers");

//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedTeachers = Object.keys(data).map((id) => ({ id, ...data[id] }));
//       loadedTeachers.forEach((teacher) => {
//         const commentsRef = dbRef(database, `comments/${teacher.id}`);
//         onValue(commentsRef, (commentSnapshot) => {
//           const commentsData = commentSnapshot.val();
//           teacher.commentCount = commentsData ? Object.keys(commentsData).length : 0;
//           setTeachers([...loadedTeachers]);
//         });
//       });        
//         setFilteredTeachers(loadedTeachers);
//       } else {
//         setTeachers([]);
//         setFilteredTeachers([]);
//       }
//     });

//     const user = auth.currentUser;
//     if (user) {
//       const userRef = dbRef(database, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           setUserDetails({
//             username: data.username || "User",
//             avatarUrl: data.avatarUrl || "./default-image.png",
//           });
//         }
//       });
//     }
//   }, []);

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     setFilteredTeachers(teachers.filter((teacher) =>
//       teacher.name.toLowerCase().includes(query) || teacher.surname.toLowerCase().includes(query)
//     ));
//   };

//   const openCommentModal = (teacherId) => {
//     setCommentModal({ isOpen: true, teacherId });

//     const database = getDatabase();
//     const commentsRef = dbRef(database, `comments/${teacherId}`);
//     onValue(commentsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
//         setComments(loadedComments);
//       } else {
//         setComments([]);
//       }
//     });
//   };

//   const closeCommentModal = () => {
//     setCommentModal({ isOpen: false, teacherId: null });
//     setComments([]);
//     setActionMenuId(null);
//     setEditingCommentId(null);
//     setNewComment("");
//   };

//   const handleCommentSubmit = (isAnonymous = false) => {
//     if (newComment.trim() === "") return;

//     const database = getDatabase();
//     const commentRef = dbRef(database, `comments/${commentModal.teacherId}`);

//     if (editingCommentId) {
//       update(dbRef(database, `comments/${commentModal.teacherId}/${editingCommentId}`), {
//         comment: newComment,
//         timestamp: new Date().toLocaleString(),
//       });
//       setEditingCommentId(null);
//     } else {
//       const newCommentRef = push(commentRef);
//       update(newCommentRef, {
//         avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//         username: isAnonymous ? "Анонимно" : userDetails.username,
//         userId: isAnonymous ? null : auth.currentUser?.uid,
//         anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null, // Сохраняем ID для анонимного комментария
//         comment: newComment,
//         timestamp: new Date().toLocaleString(),
//       });
//     }
//     setNewComment("");
//   };  


//   const handleEditComment = (commentId, commentText) => {
//     setEditingCommentId(commentId);
//     setNewComment(commentText);
//     setActionMenuId(null); 
//   };

//   const handleDeleteComment = (commentId) => {
//     const database = getDatabase();
//     remove(dbRef(database, `comments/${commentModal.teacherId}/${commentId}`));
//     setActionMenuId(null);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
//       const isActionButton = event.target.closest(".action-menu button");

//       if (!isInsideMenu && !isActionButton) {
//         setActionMenuId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);  

//   const toggleActionMenu = (commentId) => {
//     setActionMenuId((prev) => (prev === commentId ? null : commentId));
//   };

//   const [userAvatarUrl, setUserAvatarUrl] = useState(null);

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user) {

//       const db = getDatabase();
//       const userRef = dbRef(db, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const userData = snapshot.val();
//         if (userData && userData.avatarUrl) {
//           setUserAvatarUrl(userData.avatarUrl);
//         } else {
//           setUserAvatarUrl("./default-image.png");
//         }
//       });

//     }
//   }, []);

//   return (
//     <div className="glav-cotainer">
//       <section className="tch-hero">
//         <div className="faculty-image">
//           <img style={{ height: "240px", marginTop: "58px" }} width="255px" src={logoTip} alt="Фото преподавателей" />
//         </div>
//         <h1>Преподавательский Состав</h1>
//       </section>

//       <section className="teachers-section">
//         <div className="search-bar">
//           <input 
//             type="search" 
//             placeholder="Поиск преподавателя..." 
//             value={searchQuery}
//             onChange={handleSearchChange}
//             className="search-input"
//           />
//         </div>

//         <div className="tch-container">
//           {filteredTeachers.length === 0 ? (
//             <p>Преподаватели не найдены.</p>
//           ) : (
//             filteredTeachers.map((teacher) => (
//               <div className="teacher-card" key={teacher.id}>
//                 <img src={teacher.photo || defaultTeacherImg} alt={`${teacher.name} ${teacher.surname}`} />
//                 <h3>{`${teacher.name} ${teacher.surname}`}</h3>
//                 <p><strong>Предмет:</strong> {teacher.subject}</p>
//                 <p><strong>Статус:</strong> {teacher.status}</p>
//                 <div className="comment-icon-and-count">
//                 <FaCommentDots
//                   className="comment-icon"
//                   onClick={() => openCommentModal(teacher.id)}
//                 />
//                 <span className="comment-count">{teacher.commentCount || 0}</span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </section>

// {commentModal.isOpen && (
//   <div className="comment-modal-overlay">
//     <div className="comment-modal">
//       <div className="modal-header">
//         <h3>Комментарии</h3>
//         <button className="close-modal" onClick={closeCommentModal}>
//           &times;
//         </button>
//       </div>
//       <div className="comments-list">
//         {comments
//         .slice()
//         .reverse()
//         .map((comment) => (
//           <div className="comment" key={comment.id}>
//             <img
//               src={comment.avatarUrl || "./default-avatar.png"}
//               alt={comment.username}
//               className="comment-avatar"
//               onClick={() => goToProfile(comment.userId)} 
//               style={{ cursor: "pointer" }}     
//             />
//             <div className="comment-content">
//               <Link to={`/profile/${comment.userId}`} className="comment-username" style={{ cursor: "pointer" }}>
//                 <p>
//                   {comment.username}
//                 </p>
//               </Link>
//               <p className="comment-text">{comment.comment}</p>
//               <span className="comment-timestamp">{comment.timestamp}</span>
//             </div>
//             <div ref={actionMenuRef} className="menu-icon-container">
//   {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
//     <>
//       <GoKebabHorizontal
//         style={{fontSize: "20px", color: "grey"}}
//         onClick={() => toggleActionMenu(comment.id)}
//         className="action-icon"
//       />
//       {actionMenuId === comment.id && (
//         <div className={`action-menu show`}>
//           <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
//           <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
//         </div>
//       )}
//     </>
//   )}
// </div>

//           </div>
//         ))}
//       </div>
//       <div className="new-comment">
//   <input 
//     type="text" 
//     placeholder="Напишите комментарий..."
//     value={newComment} 
//     onChange={(e) => setNewComment(e.target.value)} 
//   />
//   <button onClick={() => handleCommentSubmit(false)} style={{display: "flex", alignContent: "center", justifyContent: "center"}}>
//     {editingCommentId ? "Изменить" : "Отправить"}
//     <BsSendFill style={{marginLeft: "10px", fontSize: "22px"}} />
//   </button>
//   <button onClick={() => handleCommentSubmit(true)} style={{display: "flex", alignContent: "center", justifyContent: "center"}}>
//     {editingCommentId ? "Изменить анонимно" : "Отправить анонимно"}
//     <FaUserSecret style={{marginLeft: "5px", fontSize: "25px", color: ""}} />
//   </button>
// </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default Teachers;








// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getDatabase, ref as dbRef, onValue, push, update, remove } from "firebase/database";
// import { auth } from "../firebase";
// import "../App.css";
// import "../teachers.css";
// import logoTip from "../basic-logo.png";
// import defaultTeacherImg from "../teacher.png";
// import { FaCommentDots } from "react-icons/fa";
// import basiclogo from "../basic-logo.png";
// import { FaPlusCircle, FaUserSecret } from "react-icons/fa";
// import { motion } from 'framer-motion';
// import { BsSendFill } from "react-icons/bs";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";
// import { GoKebabHorizontal } from "react-icons/go";
// import anonymAvatar from '../anonym2.jpg';
// import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
// import ttulogo from "../Ttulogo.png";
// import useTranslation from '../hooks/useTranslation';
// import { LazyLoadImage } from "react-lazy-load-image-component";

// const Teachers = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeDepartment, setActiveDepartment] = useState("Системахои Автоматикунонидашудаи Идоракуни");
//   const [activeDescription, setActiveDescription] = useState(null);
//   const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
//   const [commentModal, setCommentModal] = useState({ isOpen: false, teacherId: null });
//   const [newComment, setNewComment] = useState("");
//   const [comments, setComments] = useState([]);
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [actionMenuId, setActionMenuId] = useState(null);
//   const actionMenuRef = useRef(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const t = useTranslation();
//   const [isMenuOpen, setIsMenuOpen] = useState(() => {
//     const savedState = localStorage.getItem('isMenuOpen');
//     return savedState ? JSON.parse(savedState) : true;
//   });

//   // Массив кафедр для вкладок
//   const departments = [
//     "Системахои Автоматикунонидашудаи Идоракуни",
//     "Шабакахои Алока Ва Системахои Комутатсиони",
//     "Технологияхои Иттилооти Ва Хифзи Маълумот",
//     "Автоматонии Равандхои Технологи Ва Истехсолот",
//     "Информатика Ва Техникаи Хисоббарор"
//   ];

//   useEffect(() => {
//     localStorage.setItem('isMenuOpen', JSON.stringify(isMenuOpen));
//   }, [isMenuOpen]);

//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 700;
//       setIsMobile(mobile);
//       if (mobile) {
//         setIsMenuOpen(false);
//       } else {
//         const savedState = localStorage.getItem('isMenuOpen');
//         setIsMenuOpen(savedState ? JSON.parse(savedState) : true);
//       }
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const toggleMenuDesktop = () => {
//     setIsMenuOpen(prev => {
//       const newState = !prev;
//       localStorage.setItem('isMenuOpen', JSON.stringify(newState));
//       return newState;
//     });
//   };

//   const mainContentStyle = {
//     marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "360px" : "80px"),
//     transition: "margin 0.3s ease",
//   };

//   const currentUserHeader = {
//     marginRight: isMenuOpen ? "400px" : "80px",
//     marginBottom: isMenuOpen ? "11px" : "8px",
//     transition: "margin 0.3s ease",
//   };

//   const HeaderDesktop = {
//     margin: isMenuOpen ? "12px" : "6px 35px",
//     transition: "margin 0.3s ease",
//   };

//   const navigate = useNavigate();

//   const goToProfile = (userId) => {
//     navigate(`/profile/${userId}`);
//   };

//   useEffect(() => {
//     const database = getDatabase();
//     const teachersRef = dbRef(database, "teachers");

//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedTeachers = Object.keys(data).map((id) => ({ id, ...data[id] }));
//         loadedTeachers.forEach((teacher) => {
//           const commentsRef = dbRef(database, `comments/${teacher.id}`);
//           onValue(commentsRef, (commentSnapshot) => {
//             const commentsData = commentSnapshot.val();
//             teacher.commentCount = commentsData ? Object.keys(commentsData).length : 0;
//             setTeachers([...loadedTeachers]);
//           });
//         });
//         setTeachers(loadedTeachers);
//         setFilteredTeachers(loadedTeachers);
//       } else {
//         setTeachers([]);
//         setFilteredTeachers([]);
//       }
//     });

//     const user = auth.currentUser;
//     if (user) {
//       const userRef = dbRef(database, `users/${user.uid}`);
//       onValue(userRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           setUserDetails({
//             username: data.username || "User",
//             avatarUrl: data.avatarUrl || "./default-image.png",
//           });
//         }
//       });
//     }
//   }, []);

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     const searchFiltered = teachers.filter((teacher) =>
//       teacher.name.toLowerCase().includes(query) || teacher.surname.toLowerCase().includes(query)
//     );
//     setFilteredTeachers(searchFiltered);
//   };

//   const openCommentModal = (teacherId) => {
//     setCommentModal({ isOpen: true, teacherId });

//     const database = getDatabase();
//     const commentsRef = dbRef(database, `comments/${teacherId}`);
//     onValue(commentsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
//         setComments(loadedComments);
//       } else {
//         setComments([]);
//       }
//     });
//   };

//   const closeCommentModal = () => {
//     setCommentModal({ isOpen: false, teacherId: null });
//     setComments([]);
//     setActionMenuId(null);
//     setEditingCommentId(null);
//     setNewComment("");
//   };

//   const handleCommentSubmit = (isAnonymous = false) => {
//     if (newComment.trim() === "") return;

//     const database = getDatabase();
//     const commentRef = dbRef(database, `comments/${commentModal.teacherId}`);

//     if (editingCommentId) {
//       update(dbRef(database, `comments/${commentModal.teacherId}/${editingCommentId}`), {
//         comment: newComment,
//         timestamp: new Date().toLocaleString(),
//       });
//       setEditingCommentId(null);
//     } else {
//       const newCommentRef = push(commentRef);
//       update(newCommentRef, {
//         avatarUrl: isAnonymous ? anonymAvatar : userDetails.avatarUrl,
//         username: isAnonymous ? "Анонимно" : userDetails.username,
//         userId: isAnonymous ? null : auth.currentUser?.uid,
//         anonymousOwnerId: isAnonymous ? auth.currentUser?.uid : null,
//         comment: newComment,
//         timestamp: new Date().toLocaleString(),
//       });
//     }
//     setNewComment("");
//   };

//   const handleEditComment = (commentId, commentText) => {
//     setEditingCommentId(commentId);
//     setNewComment(commentText);
//     setActionMenuId(null);
//   };

//   const handleDeleteComment = (commentId) => {
//     const database = getDatabase();
//     remove(dbRef(database, `comments/${commentModal.teacherId}/${commentId}`));
//     setActionMenuId(null);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isInsideMenu = actionMenuRef.current && actionMenuRef.current.contains(event.target);
//       const isActionButton = event.target.closest(".action-menu button");
//       if (!isInsideMenu && !isActionButton) {
//         setActionMenuId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const toggleActionMenu = (commentId) => {
//     setActionMenuId((prev) => (prev === commentId ? null : commentId));
//   };

//   const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);

//   const toggleMenuMobile = () => {
//     if (isMenuOpenMobile) {
//       setTimeout(() => {
//         setIsMenuOpenMobile(false);
//       }, 0);
//     } else {
//       setIsMenuOpenMobile(true);
//     }
//   };

//   const headerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 1, type: 'spring', stiffness: 50 }
//     },
//   };

//   const navbarVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, type: 'spring', stiffness: 50 },
//     },
//   };

//   // Фильтрация преподавателей по выбранной кафедре
//   const displayedTeachers = searchQuery
//     ? filteredTeachers
//     : filteredTeachers.filter(teacher => teacher.cathedra === activeDepartment);

//   return (
//     <div className="glava">
//      <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
//         <div className="sidebar-header">
//         <img style={{width: "50px", height: "45px"}} src={ttulogo} alt="" />
//           {isMenuOpen ? (
//             <>
//               <h2>TTU</h2>
//               <FiChevronLeft 
//                 className="toggle-menu" 
//                 onClick={toggleMenuDesktop}
//               />
//             </>
//           ) : (
//             <FiChevronRight 
//               className="toggle-menu" 
//               onClick={toggleMenuDesktop}
//             />
//           )}
//         </div>

//         <nav className="menu-items">
//           <Link to="/" className="menu-item">
//             <FiHome className="menu-icon"/>
//             {isMenuOpen && <span>Главная</span>}
//           </Link>
//           <div className="menu-find-block">
//           <Link to="/searchpage" className="menu-item">
//              <FiSearch className="menu-icon" />
//              {isMenuOpen && <span>Поиск</span>}
//           </Link>
//           <Link to="/teachers" className="menu-item">
//              <FiUserCheck className="menu-icon" style={{borderBottom: "1px solid rgb(255, 255, 255)", borderRadius: "15px", padding: "5px"}} />
//              {isMenuOpen && <span>Преподаватели</span>}
//           </Link>
//           <Link to="/library" className="menu-item">
//              <FiBookOpen className="menu-icon" />
//              {isMenuOpen && <span>Библиотека</span>}
//           </Link>
//           </div>
//           <Link to="/myprofile" className="menu-item">
//             <FiUser className="menu-icon" />
//             {isMenuOpen && <span>Профиль</span>}
//           </Link>
//           <div className="menu-find-block">
//           <Link to="/chats" className="menu-item">
//             <FiMessageSquare className="menu-icon" />
//             {isMenuOpen && <span>Сообщения</span>}
//           </Link>
//           <Link to="/notifications" className="menu-item">
//             <FiBell className="menu-icon" />
//             {isMenuOpen && <span>Уведомления</span>}
//           </Link>
//           </div>
//           <Link to="/authdetails" className="menu-item">
//             <FiSettings className="menu-icon" />
//             {isMenuOpen && <span>Настройки</span>}
//           </Link>
//         </nav>

//         <div className="logo-and-tik">
//         TRSvaHM
//         {isMenuOpen &&
//         <div>
//         <p>&copy; 2025 Все права защищены.</p>
//         </div>
//         }
//         </div>
//       </div>
//       <div className="glav-container" style={mainContentStyle}>
//         <header>
//           <nav className="header-nav" style={HeaderDesktop}>
//             <ul className="header-ul">
//               <li><Link to="/home">Главная</Link></li>
//               <li><Link to="/about">О факультете</Link></li>
//               <li><Link to="/teachers">Преподаватели</Link></li>
//             </ul>
//             <Link to="/myprofile">
//               <div className="currentUserHeader" style={currentUserHeader}>
//                 <img
//                   src={userDetails.avatarUrl || "./default-image.png"}
//                   alt="User Avatar"
//                   className="user-avatar"
//                   style={{ width: "35px", height: "35px" }}
//                 />
//                 <span style={{ fontSize: "20px", color: "lightgreen" }}>{userDetails.username}</span>
//               </div>
//             </Link>
//           </nav>

//           <div className="header-nav-2">
//             <img src={basiclogo} width="50px" alt="logo" style={{ marginLeft: "10px" }} />
//             <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>{t('teachcollective')}</ul>
//             <div className={`burger-menu-icon ${isMenuOpenMobile ? 'open' : ''}`} onClick={toggleMenuMobile}>
//               <span className="bm-span"></span>
//               <span className="bm-span"></span>
//               <span className="bm-span"></span>
//             </div>
//             <div className={`burger-menu ${isMenuOpenMobile ? 'open' : ''}`}>
//               <ul>
//                 <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
//                 <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
//                 <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} style={{ color: "red" }} /> Преподаватели</Link></li>
//                 <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
//                 <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
//                 <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
//                 <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
//               </ul>
//             </div>
//           </div>
//         </header>

//         <section className="tch-hero">
//           <div className="faculty-image">
//             <img style={{ height: "240px", marginTop: "70px" }} width="255px" src={logoTip} alt="Фото преподавателей" />
//           </div>
//           <h1>{t('teachcollective')}</h1>
//         </section>

//         <motion.nav className="dropdown-search" variants={navbarVariants} initial="hidden" animate="visible">
//           <div className="department-dropdown" style={{ margin: "20px 0", textAlign: "center" }}>
//             <label htmlFor="department-select" style={{ marginRight: "10px", fontWeight: "bold", color: "white" }}>
//               Выберите кафедру:
//             </label>
//             <select
//               id="department-select"
//               value={activeDepartment}
//               onChange={(e) => setActiveDepartment(e.target.value)}
//               style={{ padding: "10px", borderRadius: "15px", border: "1px solid #ccc", width: "350px" }}
//             >
//               {departments.map((dept, index) => (
//                 <option key={index} value={dept}>{dept}</option>
//               ))}
//             </select>
//           </div>

//           <section className="teachers-section">
//             <div className="search-bar">
//               <input
//                 type="search"
//                 placeholder="Поиск преподавателей факультета..."
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 className="search-input"
//               />
//             </div>

//             <div className="tch-container">
//               {displayedTeachers.length === 0 ? (
//                 <p>Найдите нужного вам преподавателя.</p>
//               ) : (
//                 displayedTeachers.map((teacher) => (
//                   <div className="teacher-card" key={teacher.id}>
//                     <LazyLoadImage src={teacher.photo || defaultTeacherImg} alt={`${teacher.name} ${teacher.surname}`} className="skeleton-media-avatars" />
//                     <h3>{`${teacher.name} ${teacher.surname}`}</h3>
//                     <p><strong>Предмет:</strong> {teacher.subject}</p>
//                     <p><strong>Статус:</strong> {teacher.status}</p>
//                     <p><strong>Кафедра:</strong> {teacher.cathedra}</p>
//                     <div className="comment-icon-and-count">
//                       <FaCommentDots className="comment-icon" onClick={() => openCommentModal(teacher.id)} />
//                       <span className="comment-count">{teacher.commentCount || 0}</span>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </section>
//         </motion.nav>

//         {commentModal.isOpen && (
//           <div className="comment-modal-overlay">
//             <div className="comment-modal">
//               <div className="modal-header">
//                 <h3>Комментарии</h3>
//                 <button className="close-modal" onClick={closeCommentModal}>
//                   &times;
//                 </button>
//               </div>
//               <div className="comments-list">
//                 {comments.slice().reverse().map((comment) => (
//                   <div className="comment" key={comment.id}>
//                     <img
//                       src={comment.avatarUrl || "./default-avatar.png"}
//                       alt={comment.username}
//                       className="comment-avatar skeleton-media-avatars"
//                       onClick={() => goToProfile(comment.userId)}
//                       style={{ cursor: "pointer" }}
//                     />
//                     <div className="comment-content">
//                       <Link to={`/profile/${comment.userId}`} className="comment-username" style={{ cursor: "pointer" }}>
//                         <p>{comment.username}</p>
//                       </Link>
//                       <p className="comment-text">{comment.comment}</p>
//                       <span className="comment-timestamp">{comment.timestamp}</span>
//                     </div>
//                     <div ref={actionMenuRef} className="menu-icon-container">
//                       {(comment.userId === auth.currentUser?.uid || comment.anonymousOwnerId === auth.currentUser?.uid) && (
//                         <>
//                           <GoKebabHorizontal
//                             style={{ fontSize: "20px", color: "grey" }}
//                             onClick={() => toggleActionMenu(comment.id)}
//                             className="action-icon"
//                           />
//                           {actionMenuId === comment.id && (
//                             <div className={`action-menu show`}>
//                               <button onClick={() => handleEditComment(comment.id, comment.comment)}>Изменить</button>
//                               <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="new-comment">
//                 <input
//                   type="text"
//                   placeholder="Напишите комментарий..."
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                 />
//                 <button onClick={() => handleCommentSubmit(false)} style={{ display: "flex", alignContent: "center", justifyContent: "center" }}>
//                   {editingCommentId ? "Изменить" : "Отправить"}
//                   <BsSendFill style={{ marginLeft: "10px", fontSize: "22px" }} />
//                 </button>
//                 <button onClick={() => handleCommentSubmit(true)} style={{ display: "flex", alignContent: "center", justifyContent: "center" }}>
//                   {editingCommentId ? "Изменить анонимно" : "Отправить анонимно"}
//                   <FaUserSecret style={{ marginLeft: "5px", fontSize: "25px" }} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <motion.nav variants={navbarVariants} initial="hidden" animate="visible" className="footer-nav">
//             <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
//             <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon active-icon" /></Link>
//             <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
//             <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
//             <Link to="/myprofile">
//               <img src={userDetails.avatarUrl} alt="User Avatar" className="footer-avatar" />
//             </Link>
//           </motion.nav>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Teachers;












import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, set, onValue, push, update, remove, get } from "firebase/database";
import { auth } from "../firebase";
import "../App.css";
import "../teachers.css";
import logoTip from "../basic-logo.png";
import defaultTeacherImg from "../teacher.png";
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
import ttulogo from "../Ttulogo.png";
import useTranslation from "../hooks/useTranslation";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("Системахои Автоматикунонидашудаи Идоракуни");
  const [activeDescription, setActiveDescription] = useState(null);
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: "" });
  const [commentModal, setCommentModal] = useState({ isOpen: false, teacherId: null });
  const [newComment, setNewComment] = useState("");
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

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
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
    marginBottom: isMenuOpen ? "11px" : "8px",
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
      });
    }
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const searchFiltered = teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(query) || teacher.surname.toLowerCase().includes(query)
    );
    setFilteredTeachers(searchFiltered);
  };

  const openCommentModal = (teacherId) => {
    setCommentModal({ isOpen: true, teacherId });
    const database = getDatabase();
    const commentsRef = dbRef(database, `comments/${teacherId}`);
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedComments = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setComments(loadedComments);
      } else {
        setComments([]);
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
    if (newComment.trim() === "") return;
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
  const displayedTeachers = searchQuery
    ? filteredTeachers
    : filteredTeachers.filter((teacher) => teacher.cathedra === activeDepartment);

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
            <FiHome className="menu-icon"  />
            {isMenuOpen && <span className="txt">{t('main')}</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/searchpage" className="menu-item">
              <FiSearch className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('findstudents')}</span>}
            </Link>
            <Link to="/teachers" className="menu-item">
              <FiUserCheck className="menu-icon" style={{ color: "orange" }} />
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
                         <li><Link to="/home" className="txt">Главная</Link></li>
                         <li><Link to="/about" className="txt">О факультете</Link></li>
                         <li><Link to="/teachers" className="txt">Преподаватели</Link></li>
           
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
                <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
                <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
                <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
                <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
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
              Выберите кафедру:
            </label>
            <select
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
            </select>
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
                  <div className="teacher-card" key={teacher.id}>
                    <LazyLoadImage
                      src={teacher.photo || defaultTeacherImg}
                      alt={`${teacher.name} ${teacher.surname}`}
                      className="skeleton-media-avatars"
                    />
                    <h3>{`${teacher.name} ${teacher.surname}`}</h3>
                    <p>
                      <strong>Предмет:</strong> {teacher.subject}
                    </p>
                    <p>
                      <strong>Звание:</strong> {teacher.runk}
                    </p>
                    <p>
                      <strong>Кафедра:</strong> {teacher.cathedra}
                    </p>
                    <div className="comment-icon-and-count">
                      <FaCommentDots className="comment-icon" onClick={() => openCommentModal(teacher.id)} />
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
                <h3>Комментарии</h3>
                <button className="close-modal" onClick={closeCommentModal}>
                  &times;
                </button>
              </div>
              <div className="comments-list">
                {comments
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
                        <Link to={`/profile/${comment.userId}`} className="comment-username" style={{ cursor: "pointer" }}>
                          <p>{comment.username}</p>
                        </Link>
                        <p className="comment-text">{comment.comment}</p>
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
            {role === "teacher" && <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>}
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