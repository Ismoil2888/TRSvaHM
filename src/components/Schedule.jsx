// import React from 'react';
// import '../schedule.css';

// const Schedule = () => {
//   return (
//     <div className="bodyd">
//     <div className="containerd">
//       {/* Верхняя панель */}
//       <div className="headerd">
//         <div className="cloud-icond">☁️</div>
//         <div className="user-icond">👤</div>
//         <div className="menu-icond">☰</div>
//       </div>

//       {/* Поле поиска */}
//       <div className="search-bard">
//         <input type="text" placeholder="Search.." />
//       </div>

//       {/* Панель MyDocs */}
//       <div className="mydocs-paneld">
//         <div className="mydocs-titled">
//           <div className="icond">📁</div>
//           <div>
//             <h2>MyDocs</h2>
//             <p>3248 files, 26 folders</p>
//           </div>
//         </div>
//         <div className="storage-bard">
//           <div className="used-spaced"></div>
//         </div>
//         <p className="storage-infod">60 GB free</p>
//       </div>

//       {/* Иконки файлов */}
//       <div className="files-sectiond">
//         <div className="file-cardd">
//           <div className="file-icond">📂</div>
//           <p>Assets</p>
//           <span>.folder</span>
//         </div>
//         <div className="file-cardd">
//           <div className="file-icond">📂</div>
//           <p>Stuff</p>
//           <span>.folder</span>
//         </div>
//         <div className="file-cardd">
//           <div className="file-icond">🏔️</div>
//           <p>Mountain</p>
//           <span>.jpeg</span>
//         </div>
//         <div className="file-cardd">
//           <div className="file-icond">🎙️</div>
//           <p>Record</p>
//           <span>.mp3</span>
//         </div>
//         <div className="file-cardd">
//           <div className="file-icond">📊</div>
//           <p>Results</p>
//           <span>.xls</span>
//         </div>
//         <div className="file-cardd">
//           <div className="file-icond">📝</div>
//           <p>Project</p>
//           <span>.docx</span>
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// }

// export default Schedule;

















import React from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../App.css";
import "../schedule.css";
import basiclogo from "../basic-logo.png";
import { useState, useEffect } from 'react';
import { auth } from "../firebase";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { motion } from 'framer-motion';
import { FaPlusCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

const Schedule = () => {
  const scheduleData = [
    {
      group: "1-980101-0105А",
      days: [
        {
          day: "Понедельник",
          lessons: [
            { time: "08:00 - 08:50", subject: "", teacher: "", room: "" },
            { time: "09:00 - 09:50", subject: "КМРО/Схемотехникаи воистахои электрони", teacher: "Толибова С.Н.", room: "Ауд. 419" },
            { time: "10:00 - 10:50", subject: "ЛК/Схемотехникаи воистахои электрони", teacher: "Толибова С.Н.", room: "Ауд. 420" },
            { time: "11:00 - 11:50", subject: "ЛБ/Электротехника ва электроника", teacher: "Назримадов Д.А.", room: "Ауд. 223" },
            { time: "12:00 - 12:50", subject: "ЛК/Мудофиаи шахрванди/н.и.техники", teacher: "Зоиров Ф.Б.", room: "Ауд. 103" },
          ],
        },
        {
          day: "Вторник",
          lessons: [
            { time: "08:00 - 09:00", subject: "", teacher: "", room: "" },
            { time: "09:00 - 10:00", subject: "", teacher: "", room: "" },
            { time: "10:00 - 11:00", subject: "Сетевые технологии", teacher: "Кузнецов К.К.", room: "Ауд. 404" },
            { time: "11:00 - 12:00", subject: "Информационная безопасность", teacher: "Новиков Н.Н.", room: "Ауд. 505" },
            { time: "12:00 - 13:00", subject: "Физическая культура", teacher: "Михайлов М.М.", room: "Ауд.606" },
          ],
        },
        // Добавьте остальные дни по аналогии
      ],
    },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {

      // Получаем URL аватарки пользователя
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.avatarUrl) {
          setUserAvatarUrl(userData.avatarUrl);
        } else {
          setUserAvatarUrl("./default-image.png"); // Изображение по умолчанию
        }
      });

    }
  }, []);
  
    const toggleMenu = () => {
      if (isMenuOpen) {
        setTimeout(() => {
          setIsMenuOpen(false);
        }, 0); // Задержка для плавного исчезновения
      } else {
        setIsMenuOpen(true);
      }
    };

    const navbarVariants = {
      hidden: { opacity: 0, y: -20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, type: 'spring', stiffness: 50 },
      },
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
    }

  return (
    <div className="glav-container" onContextMenu={handleContextMenu}>
      <header>
        <nav>
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/about">О факультете</Link></li>
            <li><Link to="/teachers">Преподаватели</Link></li>
            <li><Link to="/schedule">Расписание</Link></li>
            <li><Link to="/library">Библиотека</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Расписание</ul>
          <ul>
            <li>
              <Link to="/myprofile">
              <FaUser className="user-icon"></FaUser>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-nav-2">

        <img src={basiclogo} width="50px" alt="logo" style={{marginLeft: "10px"}} />

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Расписание</ul>

        <div className={`burger-menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>          
          <span className="bm-span"></span>
          <span className="bm-span"></span>
          <span className="bm-span"></span>
        </div>

        <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>         
        <ul>
           <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
           <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} /> О факультете</Link></li>
           <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
           <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} style={{color: "red"}} /> Расписание</Link></li>
           <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
           <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
           <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
        </ul>
        </div>

        </div>
      </header>

      <section className="sch-hero">
        <h1>Расписание занятий факультета</h1>
      </section>

      <section className="schedule-section">
        <div className="sch-container">
          <h2>Расписание для каждой группы (1-Семестр / 2024)</h2>

          {scheduleData.map((groupSchedule, groupIndex) => (
            <div className="schedule-table" key={groupIndex}>
              <h3>{groupSchedule.group}</h3>
              <table>
                <thead>
                  <tr>
                    <th>День недели</th>
                    <th>Время</th>
                    <th>Предмет</th>
                    <th>Преподаватель</th>
                    <th>Аудитория</th>
                  </tr>
                </thead>
                <tbody>
                  {groupSchedule.days.map((daySchedule, dayIndex) => (
                    daySchedule.lessons.map((lesson, lessonIndex) => (
                      <tr key={lessonIndex}>
                        {lessonIndex === 0 && <td rowSpan={daySchedule.lessons.length}>{daySchedule.day}</td>}
                        <td>{lesson.time}</td>
                        <td>{lesson.subject}</td>
                        <td>{lesson.teacher}</td>
                        <td>{lesson.room}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-desktop">
        <p>&copy; 2025 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
      <motion.nav 
        variants={navbarVariants} 
        initial="hidden" 
        animate="visible" 
        className="footer-nav"
      >
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon active-icon" style={{}} /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
        </motion.nav> 
      </div>
    </div>
  );
};

export default Schedule;