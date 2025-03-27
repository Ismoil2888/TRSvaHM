import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDatabase, ref as dbRef, query, orderByChild, equalTo, onValue } from 'firebase/database';
import defaultAvatar from '../default-image.png';
import useTranslation from '../hooks/useTranslation';
import '../DepartmentTeachers.css';
import basiclogo from "../basic-logo.png";
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";

const DepartmentTeachers = () => {
  const { cathedra } = useParams(); // название кафедры передаётся в URL
  const [teachers, setTeachers] = useState([]);
  const t = useTranslation();
  const database = getDatabase();
    const navigate = useNavigate();
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
  
    // Добавляем стиль для основного контента
    const mainContentStyle = {
        marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "340px" : "110px"),
        transition: "margin 0.3s ease",
      };

    useEffect(() => {
        const usersRef = dbRef(database, 'users');
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const allUsers = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            const filtered = allUsers.filter(user =>
              (typeof user.cathedra === 'string' && user.cathedra === cathedra) ||
              (Array.isArray(user.cathedra) && user.cathedra.includes(cathedra)) ||
              user.isDean
            );
            // Сортировка: деканы (role === 'dean') первыми
            const sorted = filtered.sort((a, b) => {
              if (a.role === 'dean' && b.role !== 'dean') return -1;
              if (a.role !== 'dean' && b.role === 'dean') return 1;
              return 0;
            });
            setTeachers(sorted);
          } else {
            setTeachers([]);
          }
        });
      }, [cathedra, database]);       

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
            <FiHome className="menu-icon" style={{ color: "orange" }} />
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
    <div className="department-teachers-page" style={mainContentStyle}>
            <div className='gp-desltop-header'>
                  <Link className="back-button-gp white-icon" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                  </Link>
                  <h3 style={{ color: "grey", fontSize: "21px" }}>Преподаватели</h3>
                </div>
      <h1>Преподаватели кафедры {cathedra}</h1>
      <div className="teachers-list">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <div className="teacher-card" key={teacher.id}>
            <Link to={`/teacher-profile/${teacher.id}`} className="teacher-card-link">
              <img
                src={teacher.avatarUrl || defaultAvatar}
                alt={teacher.username}
                className="teacher-photo"
              />
              <div className="teacher-info">
                <h3>{teacher.username}</h3>
                <p><strong>Предмет:</strong> {teacher.subject}</p>
                <p>
                  <strong>{teacher.role === 'dean' ? 'Должность' : 'Звание'}:</strong>{" "}
                  {teacher.role === 'dean' ? 'Декан' : teacher.runk}
                </p>
              </div>
            </Link>
          </div>          
          ))
        ) : (
          <p>Нет преподавателей для данной кафедры.</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default DepartmentTeachers;