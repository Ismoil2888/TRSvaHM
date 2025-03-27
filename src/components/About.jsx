import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "../App.css";
import "../aboute.css";
import basiclogo from "../basic-logo.png";
import ttustudents from "../ttustudents.jpg";
import ttustudents1 from "../ttustudents1.jpg";
import ttustudents2 from "../ttustudents2.jpg";
import ttustudents3 from "../ttustudents3.jpg";
import ttulogo from "../Ttulogo.png";
import { auth } from "../firebase";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaArrowLeft } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiUserCheck, FiBookOpen, FiSearch } from "react-icons/fi";
import useTranslation from '../hooks/useTranslation';

const About = () => {
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  const navigate = useNavigate();
  const t = useTranslation();
  const [userRole, setUserRole] = useState('');
  const database = getDatabase();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);
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
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        setUserAvatarUrl(userData?.avatarUrl || "./default-image.png");
      });
    }
  }, []);


  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        // Предполагается, что роль хранится в поле role
        setUserRole(userData?.role || '');
      });
    }
  }, [database]);

  const toggleMenuMobile = () => {
    if (isMenuOpenMobile) {
      setTimeout(() => {
        setIsMenuOpenMobile(false);
      }, 0);
    } else {
      setIsMenuOpenMobile(true);
    }
  };

  // Управление открытием списка кафедр
  const [departmentsOpen, setDepartmentsOpen] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const toggleDepartment = (deptId) => {
    setDepartmentsOpen(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  // Управление открытием списка специальностей внутри кафедры
  const [specialtiesOpen, setSpecialtiesOpen] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const toggleSpecialties = (deptId) => {
    setSpecialtiesOpen(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  // Управление открытием списка курсов для каждой специальности (ключ – id специальности)
  const [coursesOpen, setCoursesOpen] = useState({});
  const toggleCourses = (specId) => {
    setCoursesOpen(prev => ({ ...prev, [specId]: !prev[specId] }));
  };

  // Список кафедр
  const departments = [
    { id: 1, name: "Системахои Автоматикунонидашудаи Идоракуни" },
    { id: 2, name: "Шабакахои Алока Ва Системахои Комутатсиони" },
    { id: 3, name: "Технологияхои Иттилооти Ва Хифзи Маълумот" },
    { id: 4, name: "Автоматонии Равандхои Технологи Ва Истехсолот" },
    { id: 5, name: "Информатика Ва Техникаи Хисоббарор" }
  ];

  // Маппинг специальностей по кафедрам
  const specialtiesByDepartment = {
    1: [
      { id: "1-530102", label: "АСКИ" },
      { id: "1-400101", label: "ТБТИ" },
    ],
    2: [
      { id: "1-450103-02", label: "ШАваТИ" },
    ],
    3: [
      { id: "1-400102-04", label: "ТИваХМ" },
      { id: "1-98010101-03", label: "ТИваХМ" },
      { id: "1-98010101-05", label: "ТИваХМ" },
    ],
    4: [
      { id: "1-530101", label: "АРТваИ" },
      { id: "1-530107", label: "АРТваИ" },
      { id: "1-400301-02", label: "АРТваИ" },
      { id: "1-400301-05", label: "АРТваИ" },
    ],
    5: [
      { id: "1-080101-07", label: "ИваТХ" },
    ]
  };

  return (
    <div style={mainContentStyle}>
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

                  {/* Дополнительные разделы для декана */}
        {userRole === 'dean' && (
          <>
            <Link to="/admin-login" className="menu-item">
              {/* Используйте подходящую иконку */}
              <FiUserCheck className="menu-icon" />
              {isMenuOpen && <span className="txt">Админ-Панель</span>}
            </Link>
          </>
        )}
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
      <header>
        <div className="header-nav-2">
          <Link className="back-button white-icon" style={{ marginLeft: "15px" }} onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </Link>
          <ul className="logo-app" style={{ color: "#58a6ff", fontSize: "25px" }}>Факультет</ul>
          <div className={`burger-menu-icon ${isMenuOpenMobile ? 'open' : ''}`} onClick={toggleMenuMobile}>
            <span className="bm-span"></span>
            <span className="bm-span"></span>
            <span className="bm-span"></span>
          </div>
          <div className={`burger-menu ${isMenuOpenMobile ? 'open' : ''}`}>
            <ul>
              <li><Link to="/home"><FontAwesomeIcon icon={faHome} /> Главная</Link></li>
              <li><Link to="/about"><FontAwesomeIcon icon={faInfoCircle} style={{ color: "red" }} /> О факультете</Link></li>
              <li><Link to="/teachers"><FontAwesomeIcon icon={faChalkboardTeacher} /> Преподаватели</Link></li>
              <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
              <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
              <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} /> Контакты</Link></li>
              <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
            </ul>
          </div>
        </div>
      </header>

      <section className="about-hero">
        <h1>О факультете Технологияхои Раками, Системахо ва Хифзи Иттилоот</h1>
        <div className="faculty-image">
          <img width={300} src={basiclogo} alt="Факультет" />
        </div>
      </section>

      <section className="slider-section">
        <h2 className="section-title" style={{ color: "black" }}>Галерея</h2>
        <Swiper className="swiper-container"
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          spaceBetween={30}
          slidesPerView={1}
          loop
        >
          <SwiperSlide><img className="swiperslide-img" src={ttustudents} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents1} alt="Фото 2" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents2} alt="Фото 3" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents3} alt="Фото 4" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents1} alt="Фото 2" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents2} alt="Фото 3" /></SwiperSlide>
          <SwiperSlide><img className="swiperslide-img" src={ttustudents3} alt="Фото 4" /></SwiperSlide>
        </Swiper>
      </section>

      {/* Раздел "Кафедры" с вложенными списками – элементы всегда отрисовываются, а класс "open" добавляется по состоянию */}
      <section className="departments-section">
        <div className="departments-container">
          <h2>Кафедры</h2>
          <ul className="departments-list">
            {departments.map((dept) => (
              <li key={dept.id} className="department-item">
                <button className="department-button" onClick={() => toggleDepartment(dept.id)}>
                  {dept.name}
                </button>
                <ul className={`department-details ${departmentsOpen[dept.id] ? "open" : ""}`}>
                  <li>
                    <button onClick={() => toggleSpecialties(dept.id)} className="sub-dropdown-button">
                      Специальности
                    </button>
                    <ul className={`specialties-list ${specialtiesOpen[dept.id] ? "open" : ""}`}>
                      {specialtiesByDepartment[dept.id]?.map((spec) => (
                        <li key={spec.id} className="specialty-item">
                          <button onClick={() => toggleCourses(spec.id)} className="specialty-button">
                            {spec.id} - {spec.label}
                          </button>
                          <ul className={`courses-list ${coursesOpen[spec.id] ? "open" : ""}`}>
                            {["1", "2", "3", "4"].map((course) => (
                              <li key={course} className="course-item">
                                <Link to={`/group/${course}/${encodeURIComponent(`${spec.id} - ${spec.label}`)}`}>
                                  Курс {course}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    <Link to={`/department-teachers/${encodeURIComponent(dept.name)}`} className="department-teachers-link">
                      Преподаватели
                    </Link>
                  </li>

                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="footer-desktop">
        <p>&copy; 2025 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default About;