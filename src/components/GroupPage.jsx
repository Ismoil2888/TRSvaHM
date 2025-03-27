import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import defaultAvatar from "../default-image.png";
import "../SpecialtyPage.css";
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiUserCheck, FiBookOpen, FiSearch } from "react-icons/fi";
import useTranslation from '../hooks/useTranslation';
import basiclogo from "../basic-logo.png";

const GroupPage = () => {
  // Принимаем два параметра: course и groupName
  const t = useTranslation();
  const { course, groupName } = useParams();
  const [groupUsers, setGroupUsers] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const database = getDatabase();
  const navigate = useNavigate();
  const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
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
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "340px" : "110px"),
    transition: "margin 0.3s ease",
  };

  useEffect(() => {
    // Обращаемся к данным группы по курсу и названию группы
    const groupDataRef = dbRef(database, `groups/${course}/${groupName}`);
    onValue(groupDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setGroupUsers(users);
      } else {
        setGroupUsers([]);
      }
    });
  }, [database, course, groupName]);

  useEffect(() => {
    // Обращаемся к расписанию по курсу и названию группы
    const scheduleRef = dbRef(database, `schedules/${course}/${groupName}`);
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Сортировка уроков по порядку для каждого дня
        daysOrder.forEach(day => {
          if (data[day] && Array.isArray(data[day])) {
            data[day].sort((a, b) => a.order - b.order);
          }
        });
      }
      setSchedule(data);
    });
  }, [database, course, groupName]);

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
      <div className="header-gp">
        <Link style={{ marginRight: "50px" }} className="back-button gp white-icon" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </Link>
        <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "20px" }}>Группа: {groupName}, Курс: {course}</ul>
      </div>
      <div className="group-page" style={mainContentStyle}>
        <div className='gp-desltop-header'>
          <Link className="back-button-gp white-icon" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </Link>
          <h3 style={{ color: "grey", fontSize: "21px" }}>Группа: {groupName} (Курс: {course})</h3>
        </div>

        {schedule && (
          <div className="group-schedule">
            <h2>Расписание уроков</h2>
            <div className="group-schedule-flex">
              {daysOrder.map(day => (
                <div key={day} className="day-schedule-display">
                  <h3>{t(day)}</h3>
                  {schedule[day] && schedule[day].length ? (
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>№</th>
                          <th>{t("subject")}</th>
                          <th>{t("startTime")}</th>
                          <th>{t("endTime")}</th>
                          <th>{t("teacher")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule[day].map((lesson, index) => (
                          <tr key={index}>
                            <td>{lesson.order}</td>
                            <td>{lesson.subject}</td>
                            <td>{lesson.startTime}</td>
                            <td>{lesson.endTime}</td>
                            <td>{lesson.teacher}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>{t("scheduleNotSetFor")} {t(day)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

<div className="group-users">
      <h2>Студенты этой специальности</h2>
      {groupUsers.map(user => (
        <div key={user.id} className="user-block">
          {/* Можно обернуть аватарку и имя в Link */}
          <Link 
            to={`/profile/${user.userId || user.id}`} 
            className="user-link"
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            <img
              src={user.userAvatar || user.photoUrl || defaultAvatar}
              alt={user.fio}
              className="user-photo"
            />
            <div className="user-info">
              <p className="username">{user.username || "Без имени"}</p>
              <p className="fio">{user.fio}</p>
              <p className="meta">
                <span>Факультет: {user.faculty}</span> |{" "}
                <span>Курс: {user.course}</span> |{" "}
                <span>Группа: {user.group}</span>
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>

      </div>
    </div>
  );
};

export default GroupPage;