// import React, { useState } from 'react';
// import { Link, useNavigate } from "react-router-dom";
// import { Swiper, SwiperSlide } from "swiper/react";
// import ttulogo from "../Ttulogo.png";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";
// import glkorpusosimi from "../glkorpusosimi.jpg";
// import basiclogo from "../basic-logo.png";
// import ttustudents from "../ttustudents.jpg";
// import ttustudents1 from "../ttustudents1.jpg";
// import ttustudents2 from "../ttustudents2.jpg";
// import ttustudents3 from "../ttustudents3.jpg";
// import photo from "../Каримзода.jpg";

// const WelcomePage = () => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Варианты анимации для шапки и навигации
//   const headerVariants = {
//     hidden: { opacity: 0, y: -50 },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       transition: { duration: 1, type: 'spring', stiffness: 80 } 
//     },
//   };

//   const navbarVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, type: 'spring', stiffness: 80 },
//     },
//   };

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//     document.body.classList.toggle('dark-theme');
//   };

//   return (
// <div className="app">
//       <div className="hp-header">
//         <div className="hp-header-logo">
//           <img src={basiclogo} alt="Логотип" />
//         </div>
//         <div className="hp-header-title">
//         <h1>
//           ФАКУЛТЕТИ ТЕХНОЛОГИЯҲОИ РАҚАМӢ,
//         </h1>
//         <h1>СИСТЕМАҲО ВА ҲИФЗИ ИТТИЛООТ</h1>
//         </div>
//         <div className="hp-header-icon">
//           <img src={ttulogo} alt="Логотип 2" />
//         </div>
//       </div>

//       <nav className="hp-navbar">
//         <ul>
//           <li><Link to="/home">Асосӣ</Link></li>
//             <li><Link to="/about">Факултет</Link></li>
//             <li>Кафедраҳо</li>
//             <li><Link to="/teachers">Омӯзгорон</Link></li>
//             <li><Link to="/schedule">Ҷадвали дарсҳо</Link></li>
//             <li><Link to="/library">Китобхонаи электронӣ</Link></li>
//             <li><Link to="/contacts">Тамос</Link></li>
//         </ul>
//         <ul>
//           <li><Link to="/signup" style={{marginLeft: "25px", fontWeight: "bold", color: "lightgreen", border: "1px solid lightgreen", borderRadius: "15px", padding: "5px", background: "white"}}>Ба система ворид шудан</Link></li>
//         </ul>
//       </nav>

//       <main className="hp-main-content">
//         <section className="slider-section">
//         <h2 className="section-title" style={{color: "black"}}>Галерея</h2>
//         <Swiper className="swiper"
//           modules={[Navigation, Pagination, Autoplay]}
//           navigation
//           pagination={{ clickable: true }}
//           autoplay={{ delay: 3000 }}
//           spaceBetween={30}
//           slidesPerView={1}
//           loop
//         >
//           <SwiperSlide><img style={{width: "100%"}} src={glkorpusosimi} alt="Фото 1" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents} alt="Фото 1" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents1} alt="Фото 2" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents2} alt="Фото 3" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents3} alt="Фото 4" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents} alt="Фото 1" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents1} alt="Фото 2" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents2} alt="Фото 3" /></SwiperSlide>
//           <SwiperSlide><img style={{width: "100%"}} src={ttustudents3} alt="Фото 4" /></SwiperSlide>
//         </Swiper>
//       </section>
//         <section className="hp-news-section">
//           <div className="hp-news-run">
//             <marquee behavior="scroll" direction="left">
//             <div class="scrolling-banner">
//               <div class="scrolling-text">
//                 <pre>
//                  ИҚТИБОС АЗ УМАРИ ХАЙЁМ:  „Не верь тому, кто говорит красиво, в его словах всегда игра. Поверь тому, кто молчаливо, творит красивые дела.“    „Молчанье — щит от многих бед, А болтовня всегда во вред. Язык у человека мал, Но сколько жизней он сломал.“  | Умари Хайём |
//                 </pre>
//               </div>
//             </div>
//             </marquee>
//           </div>
//           <h2>Хабарҳои охирин</h2>
//           <div className="hp-news-grid">
//             {Array(6)
//               .fill(0)
//               .map((_, index) => (
//                 <div key={index} className="hp-news-item">
//                   <div className="hp-news-date">02/12/2024</div>
//                   <img
//                     src={photo}
//                     alt="News"
//                     className="hp-news-image"
//                   />
//                   <p>Масъалаҳои муосири саноати мошинсозӣ</p>
//                 </div>
//               ))}
//           </div>
//         </section>
//       </main>

//       <footer className="hp-footer">
//         <p>
//           Донишгоҳи техникии Тоҷикистон ба номи академик М.С. Осимӣ
//           <br />
//           Чумҳурии Тоҷикистон, 734042, ш. Душанбе, хиёбони академик Раҳимҷонов
//           10
//         </p>
//         <p>Email: info@ttu.tj, ttu@ttu.tj</p>
//         <p>+992 (372) 21-35-11 | +992 (372) 23-02-46</p>
//       </footer>
//     </div>
//   );
// };

// export default WelcomePage;









import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import ttulogo from "../Ttulogo.png";
import glkorpusosimi from "../glkorpusosimi.jpg";
import basiclogo from "../basic-logo.png";
import ttustudents from "../ttustudents.jpg";
import ttustudents1 from "../ttustudents1.jpg";
import ttustudents2 from "../ttustudents2.jpg";
import ttustudents3 from "../ttustudents3.jpg";
import photo from "../Каримзода.jpg";

import "../WelcomePage.css";

const WelcomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("news");

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  // Отрисовка содержимого вкладок: Новости и Галерея
  const renderTabContent = () => {
    if (activeTab === "news") {
      return (
        <div className="news-grid">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                className="news-item widget-card"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="news-date">02/12/2024</div>
                <img src={photo} alt="News" className="news-image" />
                <p>Масъалаҳои муосири саноати мошинсозӣ</p>
              </motion.div>
            ))}
        </div>
      );
    } else if (activeTab === "gallery") {
      return (
        <div className="slider-section">
          <Swiper
            className="modern-swiper"
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            spaceBetween={30}
            slidesPerView={1}
            loop
          >
            <SwiperSlide>
              <img className="swiper-image" src={glkorpusosimi} alt="Gallery 1" />
            </SwiperSlide>
            <SwiperSlide>
              <img className="swiper-image" src={ttustudents} alt="Gallery 2" />
            </SwiperSlide>
            <SwiperSlide>
              <img className="swiper-image" src={ttustudents1} alt="Gallery 3" />
            </SwiperSlide>
            <SwiperSlide>
              <img className="swiper-image" src={ttustudents2} alt="Gallery 4" />
            </SwiperSlide>
            <SwiperSlide>
              <img className="swiper-image" src={ttustudents3} alt="Gallery 5" />
            </SwiperSlide>
          </Swiper>
        </div>
      );
    }
  };

  return (
    <div className={`app serious-app ${isDarkMode ? 'dark' : ''}`}>
      <div className="hp-header serious-header">
        <motion.div
          className="hp-header-logo"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: 'spring', stiffness: 80 }}
        >
          <img src={basiclogo} alt="Логотип" />
        </motion.div>
        <motion.div
          className="hp-header-title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring', stiffness: 80 }}
        >
          <h1>ФАКУЛТЕТИ ТЕХНОЛОГИЯҲОИ РАҚАМӢ,</h1>
          <h1>СИСТЕМАҲО ВА ҲИФЗИ ИТТИЛООТ</h1>
        </motion.div>
        <motion.div
          className="hp-header-icon"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 80 }}
        >
          <img src={ttulogo} alt="Логотип 2" />
        </motion.div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </div>

      <div className="hp-navbar serious-navbar">
        <motion.ul
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
        >
          <li><Link to="/home">Асосӣ</Link></li>
          <li><Link to="/about">Факултет</Link></li>
          <li><Link to="/departments">Кафедраҳо</Link></li>
          <li><Link to="/teachers">Омӯзгорон</Link></li>
          <li><Link to="/schedule">Ҷадвали дарсҳо</Link></li>
          <li><Link to="/library">Китобхонаи электронӣ</Link></li>
          <li><Link to="/contacts">Тамос</Link></li>
          <li>
            <Link to="/signup" className="signup-link widget-card">
              Ба система ворид шудан
            </Link>
          </li>
        </motion.ul>
      </div>

      <div className="hp-main-content serious-content">
        <div className="content-grid">
          <div className="main-tab-content">
            <div className="tabs">
              <button 
                className={`tab-button ${activeTab === 'news' ? 'active' : ''}`} 
                onClick={() => setActiveTab('news')}
              >
                Хабарҳо
              </button>
              <button 
                className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`} 
                onClick={() => setActiveTab('gallery')}
              >
                Галерея
              </button>
            </div>
            <section className="tab-content">
              {renderTabContent()}
            </section>
          </div>
          <aside className="side-widgets">
            <motion.div 
              className="widget widget-card blur-effect"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3>Курсы валют</h3>
              <p>USD: 11.50 | EUR: 12.80</p>
            </motion.div>
            <motion.div 
              className="widget widget-card blur-effect"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3>Погода</h3>
              <p>Душанбе: 25°C, облачно</p>
            </motion.div>
            <motion.div 
              className="widget widget-card blur-effect"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3>События</h3>
              <p>Вебинар: 14:00, 05.05.2024</p>
            </motion.div>
          </aside>
        </div>
      </div>

      <footer className="hp-footer serious-footer">
        <p>
          Донишгоҳи техникии Тоҷикистон ба номи академик М.С. Осимӣ<br />
          Чҷаи Тоҷикистон, 734042, ш. Душанбе, хиёбони академик Раҳимҷонов 10
        </p>
        <p>Email: info@ttu.tj, ttu@ttu.tj</p>
        <p>+992 (372) 21-35-11 | +992 (372) 23-02-46</p>
      </footer>
    </div>
  );
};

export default WelcomePage;