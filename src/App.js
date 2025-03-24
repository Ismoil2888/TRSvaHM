import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
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
import { LanguageProvider } from './contexts/LanguageContext';
import { applyTheme } from "./theme";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // состояние для загрузки
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

useEffect(() => {
  // Считываем сохранённую тему или задаём стандартную
  const savedTheme = localStorage.getItem('theme') || 'standard';
  applyTheme(savedTheme);
}, []);

  // Проверка PWA
  useEffect(() => {
    // Проверяем, мобильное ли устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Проверяем, установлено ли уже PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    // Обработчик для события beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Показываем промпт если это мобильное устройство и PWA не установлено
    if (isMobile && !isInStandaloneMode && deferredPrompt) {
      setShowPWAInstallPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  // Обработчик установки PWA
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPWAInstallPrompt(false);
      }
    }
  };

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
    <LanguageProvider>
    <>
    {showPWAInstallPrompt && (
      <div className="pwa-install-overlay">
        <div className="pwa-install-modal">
          <div className='close-button-and-icon'>
          <button 
            className="pwa-close-btn"
            onClick={() => setShowPWAInstallPrompt(false)}
          >
            ×
          </button>
          <img className='pwa-icon' src="/logoapp512.png"/>
          </div>
          <div style={{ marginTop: "20px" }}>
          <h2>Установите наше приложение</h2>
          <p>Для удобного доступа установите приложение</p>
          <div className="pwa-buttons">
            <button 
              className="install-btn"
              onClick={handleInstall}
            >
              Установить
            </button>
            <button 
              className="skip-btn"
              onClick={() => setShowPWAInstallPrompt(false)}
            >
              Пропустить
            </button>
            </div>
          </div>
        </div>
      </div>
    )}

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
    </>
    </LanguageProvider>
  );
}

export default App;