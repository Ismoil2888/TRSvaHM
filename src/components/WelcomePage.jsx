import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import ttulogo from "../Ttulogo.png";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import glkorpusosimi from "../glkorpusosimi.jpg";
import basiclogo from "../basic-logo.png";
import ttustudents from "../ttustudents.jpg";
import ttustudents1 from "../ttustudents1.jpg";
import ttustudents2 from "../ttustudents2.jpg";
import ttustudents3 from "../ttustudents3.jpg";
import photo from "../Каримзода.jpg";

const WelcomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Варианты анимации для шапки и навигации
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, type: 'spring', stiffness: 80 } 
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 80 },
    },
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  return (
<div className="app">
      <div className="hp-header">
        <div className="hp-header-logo">
          <img src={basiclogo} alt="Логотип" />
        </div>
        <div className="hp-header-title">
        <h1>
          ФАКУЛТЕТИ ТЕХНОЛОГИЯҲОИ РАҚАМӢ,
        </h1>
        <h1>СИСТЕМАҲО ВА ҲИФЗИ ИТТИЛООТ</h1>
        </div>
        <div className="hp-header-icon">
          <img src={ttulogo} alt="Логотип 2" />
        </div>
      </div>

      <nav className="hp-navbar">
        <ul>
          <li><Link to="/home">Асосӣ</Link></li>
            <li><Link to="/about">Факултет</Link></li>
            <li>Кафедраҳо</li>
            <li><Link to="/teachers">Омӯзгорон</Link></li>
            <li><Link to="/schedule">Ҷадвали дарсҳо</Link></li>
            <li><Link to="/library">Китобхонаи электронӣ</Link></li>
            <li><Link to="/contacts">Тамос</Link></li>
        </ul>
        <ul>
          <li><Link to="/signup" style={{marginLeft: "25px", fontWeight: "bold", color: "lightgreen", border: "1px solid lightgreen", borderRadius: "15px", padding: "5px", background: "white"}}>Ба система ворид шудан</Link></li>
        </ul>
      </nav>

      <main className="hp-main-content">
        <section className="slider-section">
        <h2 className="section-title" style={{color: "black"}}>Галерея</h2>
        <Swiper className="swiper"
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          spaceBetween={30}
          slidesPerView={1}
          loop
        >
          <SwiperSlide><img style={{width: "100%"}} src={glkorpusosimi} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents1} alt="Фото 2" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents2} alt="Фото 3" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents3} alt="Фото 4" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents} alt="Фото 1" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents1} alt="Фото 2" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents2} alt="Фото 3" /></SwiperSlide>
          <SwiperSlide><img style={{width: "100%"}} src={ttustudents3} alt="Фото 4" /></SwiperSlide>
        </Swiper>
      </section>
        <section className="hp-news-section">
          <div className="hp-news-run">
            <marquee behavior="scroll" direction="left">
            <div class="scrolling-banner">
              <div class="scrolling-text">
                <pre>
                 ИҚТИБОС АЗ УМАРИ ХАЙЁМ:  „Не верь тому, кто говорит красиво, в его словах всегда игра. Поверь тому, кто молчаливо, творит красивые дела.“    „Молчанье — щит от многих бед, А болтовня всегда во вред. Язык у человека мал, Но сколько жизней он сломал.“  | Умари Хайём |
                </pre>
              </div>
            </div>
            </marquee>
          </div>
          <h2>Хабарҳои охирин</h2>
          <div className="hp-news-grid">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="hp-news-item">
                  <div className="hp-news-date">02/12/2024</div>
                  <img
                    src={photo}
                    alt="News"
                    className="hp-news-image"
                  />
                  <p>Масъалаҳои муосири саноати мошинсозӣ</p>
                </div>
              ))}
          </div>
        </section>
      </main>

      <footer className="hp-footer">
        <p>
          Донишгоҳи техникии Тоҷикистон ба номи академик М.С. Осимӣ
          <br />
          Чумҳурии Тоҷикистон, 734042, ш. Душанбе, хиёбони академик Раҳимҷонов
          10
        </p>
        <p>Email: info@ttu.tj, ttu@ttu.tj</p>
        <p>+992 (372) 21-35-11 | +992 (372) 23-02-46</p>
      </footer>
    </div>
  );
};

export default WelcomePage;