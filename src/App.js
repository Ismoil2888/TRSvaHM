import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import './App.css';
import { auth } from './firebase';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AuthDetails from './components/AuthDetails';
import HomePage from "./components/HomePage";
import Library from "./components/Library";
import LibraryPage from './components/LibraryPage';
import Schedule from "./components/Schedule";
import Teachers from "./components/Teachers";
import Contacts from "./components/Contacts";
import WelcomePage from './components/WelcomePage';
import TeachersPage from './components/TeachersPage';
import AdminPanel from './components/AdminPanel';
import BlankForm from "./components/BlankForm";
import AdminLogin from './components/AdminLogin';
import NotfoundPage from './components/NotfoundPage';
import About from './components/About';
import PrivateRoute from "./components/PrivateRoute";
import AdminPrivateRoute from "./components/AdminPrivateRoute";
import TeacherLogin from './components/TeacherLogin';
import TeacherProfile from './components/TeacherProfile';
import SearchPage  from './components/SearchPage';
import UserProfile from './components/UserProfile';
import MyProfile from './components/MyProfile';
import SearchStudents from './components/SearchStudents';
import PostForm from "./components/PostForm";
import NotificationsPage from "./components/NotificationsPage";
import Chat from "./components/Chat";
import ChatList from "./components/ChatList";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // состояние для загрузки

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false); // завершаем загрузку после получения статуса авторизации
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    // Показываем загрузочный экран, пока идет проверка
    return <div className="loading-container">
    <div className="loading-circuit">
        <div className="circle"></div>
        <div className="line"></div>
        <div className="circle"></div>
        <div className="line"></div>
        <div className="circle"></div>
    </div>
    <p className="loading-text">Securing Connection...</p>
</div>;
  }

    // Блокировка контекстного меню
    const disableContextMenu = () => {
      const onContextMenu = (event) => event.preventDefault();
      document.addEventListener("contextmenu", onContextMenu);

      return () => {
        document.removeEventListener("contextmenu", onContextMenu);
      };
    };

    // Блокировка выделения текста
    const disableTextSelection = () => {
      const onSelectStart = (event) => event.preventDefault();
      document.addEventListener("selectstart", onSelectStart);

      return () => {
        document.removeEventListener("selectstart", onSelectStart);
      };
    };

    disableContextMenu();
    disableTextSelection();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <HomePage /> : <WelcomePage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/authdetails" element={<PrivateRoute> <AuthDetails /> </PrivateRoute>} />
      <Route path="/myprofile" element={<PrivateRoute> <MyProfile /> </PrivateRoute>} />
      <Route path="/profile/:userId" element={<UserProfile />} />      
      <Route path="/about" element={<PrivateRoute> <About /> </PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute>  <HomePage /> </PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute> <NotificationsPage /> </PrivateRoute>} />
      <Route path="/post" element={<PrivateRoute>  <PostForm /> </PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute> <Schedule /> </PrivateRoute>} />
      <Route path="/teachers" element={<PrivateRoute> <Teachers /> </PrivateRoute>} />
      <Route path="/library" element={<PrivateRoute> <Library /> </PrivateRoute>} />
      <Route path="/libraryp" element={<PrivateRoute> <LibraryPage /> </PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute> <Contacts /> </PrivateRoute>} />
      <Route path="/searchpage" element={<PrivateRoute> <SearchPage /> </PrivateRoute>} />
      <Route path="/searchstudents" element={<PrivateRoute> <SearchStudents /> </PrivateRoute>} />
      <Route path="/welcomepage" element={<WelcomePage />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-profile/:id" element={<TeacherProfile />} />
      <Route path="/admin" element={<AdminPrivateRoute> <AdminPanel /> </AdminPrivateRoute>} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/blank" element={<BlankForm />} />
      <Route path="*" element={<NotfoundPage />} />
      <Route path="/chat/:chatRoomId" element={<PrivateRoute> <Chat /> </PrivateRoute>} />
      <Route path="/chats" element={<PrivateRoute> <ChatList /> </PrivateRoute>} />
    </Routes>
  );
}

export default App;


// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Link, useNavigate } from "react-router-dom";
// import './App.css';
// import { auth } from './firebase';
// import SignUp from './components/SignUp';
// import SignIn from './components/SignIn';
// import AuthDetails from './components/AuthDetails';
// import HomePage from "./components/HomePage";
// import Library from "./components/Library";
// import LibraryPage from './components/LibraryPage';
// import Schedule from "./components/Schedule";
// import Teachers from "./components/Teachers";
// import Contacts from "./components/Contacts";
// import WelcomePage from './components/WelcomePage';
// import TeachersPage from './components/TeachersPage';
// import AdminPanel from './components/AdminPanel';
// import BlankForm from "./components/BlankForm";
// import AdminLogin from './components/AdminLogin';
// import NotfoundPage from './components/NotfoundPage';
// import About from './components/About';
// import PrivateRoute from "./components/PrivateRoute";
// import AdminPrivateRoute from "./components/AdminPrivateRoute";
// import TeacherLogin from './components/TeacherLogin';
// import TeacherProfile from './components/TeacherProfile';
// import SearchPage  from './components/SearchPage';
// import UserProfile from './components/UserProfile';
// import MyProfile from './components/MyProfile';
// import SearchStudents from './components/SearchStudents';
// import PostForm from "./components/PostForm";
// import NotificationsPage from "./components/NotificationsPage";
// import Chat from "./components/Chat";
// import ChatList from "./components/ChatList";
// import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookmark } from "react-icons/fi";
// import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch, faBell } from "@fortawesome/free-solid-svg-icons";
// import { BsChatTextFill } from "react-icons/bs";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import basiclogo from "./basic-logo.png";
// import ttulogo from "./Ttulogo.png";

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true); // состояние для загрузки
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 700;
//       setIsMobile(mobile);
//       if (mobile) {
//         setIsMenuOpen(false);
//       } else {
//         setIsMenuOpen(true);
//       }
//     };
  
//     checkMobile(); // Проверка при монтировании
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setIsAuthenticated(!!user);
//       setIsLoading(false); // завершаем загрузку после получения статуса авторизации
//     });

//     return () => unsubscribe();
//   }, []);

//   if (isLoading) {
//     // Показываем загрузочный экран, пока идет проверка
//     return <div className="loading-container">
//     <div className="loading-circuit">
//         <div className="circle"></div>
//         <div className="line"></div>
//         <div className="circle"></div>
//         <div className="line"></div>
//         <div className="circle"></div>
//     </div>
//     <p className="loading-text">Securing Connection...</p>
// </div>;
//   }

//     // Блокировка контекстного меню
//     const disableContextMenu = () => {
//       const onContextMenu = (event) => event.preventDefault();
//       document.addEventListener("contextmenu", onContextMenu);

//       return () => {
//         document.removeEventListener("contextmenu", onContextMenu);
//       };
//     };

//     // Блокировка выделения текста
//     const disableTextSelection = () => {
//       const onSelectStart = (event) => event.preventDefault();
//       document.addEventListener("selectstart", onSelectStart);

//       return () => {
//         document.removeEventListener("selectstart", onSelectStart);
//       };
//     };

//     disableContextMenu();
//     disableTextSelection();

// const toggleMenuu = () => {
//   if (isMenuOpen) {
//     setTimeout(() => {
//       setIsMenuOpen(false);
//     }, 0);
//   } else {
//     setIsMenuOpen(true);
//   }
// };
  
//     // Добавляем стиль для основного контента
// const mainContentStyle = {
//   marginLeft: isMenuOpen ? "400px" : "80px",
//   transition: "margin 0.3s ease",
// };

// const HeaderDesktop = {
//   margin: isMenuOpen ? "12px" : "0 20px",
//   transition: "margin 0.3s ease",
// };

//   return (
//     <div className="glava">
//         <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
//       <div className="sidebar-header">
//         {isMenuOpen ? (
//           <>
//           <div style={{display: "flex", gap: "15px"}}>
//           <img style={{width: "45px", height: "45px"}} src={ttulogo} alt="" />
//             <h2>TTU</h2>
//           </div>
//             <FiChevronLeft 
//               className="toggle-menu" 
//               onClick={() => setIsMenuOpen(false)}
//             />
//           </>
//         ) : (
//           <FiChevronRight 
//             className="toggle-menu" 
//             onClick={() => setIsMenuOpen(true)}
//           />
//         )}
//       </div>

//       <nav className="menu-items">
//         <Link to="/" className="menu-item">
//           <FiHome className="menu-icon" />
//           {isMenuOpen && <span>Главная</span>}
//         </Link>
//         <Link to="/myprofile" className="menu-item">
//           <FiUser className="menu-icon" />
//           {isMenuOpen && <span>Профиль</span>}
//         </Link>
//         <Link to="/chats" className="menu-item">
//           <FiMessageSquare className="menu-icon" />
//           {isMenuOpen && <span>Сообщения</span>}
//         </Link>
//         <Link to="/notifications" className="menu-item">
//           <FiBell className="menu-icon" />
//           {isMenuOpen && <span>Уведомления</span>}
//         </Link>
//         <Link to="/saved" className="menu-item">
//           <FiBookmark className="menu-icon" />
//           {isMenuOpen && <span>Сохраненное</span>}
//         </Link>
//         <Link to="/authdetails" className="menu-item">
//           <FiSettings className="menu-icon" />
//           {isMenuOpen && <span>Настройки</span>}
//         </Link>
//       </nav>

//       {isMenuOpen && (
//         <div className="logo-and-tik">
//           <img 
//             src={basiclogo} 
//             alt="logo" 
//             className="tiklogo"
//           />
//           <span style={{fontSize: "35px", fontWeight: "bold", color: "#9daddf"}}>TIK</span>
//         </div>
//       )}
//     </div>
//   <div className="home-container" style={mainContentStyle}>

//     <header>
//       <nav style={HeaderDesktop}>
//         <ul>
//           <li><Link to="/home">Главная</Link></li>
//           <li><Link to="/about">О факультете</Link></li>
//           <li><Link to="/teachers">Преподаватели</Link></li>
//         </ul>
//       </nav>

//       <div className="header-nav-2">

//         <Link to="/notifications">
//           <div style={{ position: "relative" }}>
//             <FontAwesomeIcon icon={faBell} style={{marginLeft: "15px"}} className="footer-icon" />
//           </div>
//         </Link>

//         <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Главная</ul>

//         <Link to="/chats">
// <div style={{ position: "relative" }}>
//   <BsChatTextFill style={{ fontSize: "25px", marginRight: "15px", color: "white" }} />
// </div>
// </Link>
//         <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenuu}>          
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//           <span className="bm-span"></span>
//         </div>

//         <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
//         <ul>
//            <li><Link to="/home"><FontAwesomeIcon icon={faHome} style={{color: "red"}} /> Главная</Link></li>
//            <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
//            <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
//            <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
//            <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
//            <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
//            <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
//         </ul>
//         </div>

//       </div>
//     </header>
//   </div>

//     <Routes>
//       <Route path="/" element={isAuthenticated ? <HomePage /> : <SignIn />} />
//       <Route path="/signup" element={<SignUp />} />
//       <Route path="/authdetails" element={<AuthDetails />} />
//       <Route path="/myprofile" element={<MyProfile />} />
//       <Route path="/profile/:userId" element={<UserProfile />} />      
//       <Route path="/about" element={<PrivateRoute> <About /> </PrivateRoute>} />
//       <Route path="/home" element={<PrivateRoute>  <HomePage /> </PrivateRoute>} />
//       <Route path="/notifications" element={<NotificationsPage />} />
//       <Route path="/post" element={<PrivateRoute>  <PostForm /> </PrivateRoute>} />
//       <Route path="/schedule" element={<PrivateRoute> <Schedule /> </PrivateRoute>} />
//       <Route path="/teachers" element={<PrivateRoute> <Teachers /> </PrivateRoute>} />
//       <Route path="/library" element={<PrivateRoute> <Library /> </PrivateRoute>} />
//       <Route path="/libraryp" element={<PrivateRoute> <LibraryPage /> </PrivateRoute>} />
//       <Route path="/contacts" element={<PrivateRoute> <Contacts /> </PrivateRoute>} />
//       <Route path="/searchpage" element={<PrivateRoute> <SearchPage /> </PrivateRoute>} />
//       <Route path="/searchstudents" element={<PrivateRoute> <SearchStudents /> </PrivateRoute>} />
//       <Route path="/welcomepage" element={<WelcomePage />} />
//       <Route path="/teachers" element={<TeachersPage />} />
//       <Route path="/teacher-login" element={<TeacherLogin />} />
//       <Route path="/teacher-profile/:id" element={<TeacherProfile />} />
//       <Route path="/admin" element={<AdminPrivateRoute> <AdminPanel /> </AdminPrivateRoute>} />
//       <Route path="/admin-login" element={<AdminLogin />} />
//       <Route path="/blank" element={<BlankForm />} />
//       <Route path="*" element={<NotfoundPage />} />
//       <Route path="/chat/:chatRoomId" element={<Chat />} />
//       <Route path="/chats" element={<ChatList />} />
//     </Routes>
//     </div>
//   );
// }

// export default App;