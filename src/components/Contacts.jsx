import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../contact.css";
import basiclogo from "../basic-logo.png";
import { auth } from "../firebase";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaUser } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { faHome, faInfoCircle, faChalkboardTeacher, faCalendarAlt, faBook, faPhone, faUserCog, faSearch } from "@fortawesome/free-solid-svg-icons";

const ContactsPage = () => {
  const [showButton, setShowButton] = useState(false); // Управление состоянием кнопки

  useEffect(() => {
    // Загружаем виджет сразу, когда компонент монтируется
    loadWidget();

    // Убираем виджет, когда пользователь покидает страницу
    return () => {
      removeWidget();
    };
  }, []);

  // Функция для загрузки виджета
  const loadWidget = () => {
    const scriptId = "fxo-widget-script";
    const isScriptLoaded = document.querySelector(`#${scriptId}`);

    if (!isScriptLoaded) {
      const script = document.createElement("script");
      script.src = "https://widget.flowxo.com/embed.js";
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.setAttribute(
        "data-fxo-widget",
        "eyJ0aGVtZSI6IiMyYWE4NjMiLCJ3ZWIiOnsiYm90SWQiOiI2NzM3MzViZjYxMGIzNjAwNTIwZTFmZWMiLCJ0aGVtZSI6IiMyYWE4NjMiLCJsYWJlbCI6IlQgSSBLIC0g0J/QvtC80L7RidC90LjQuiAifSwid2VsY29tZVRleHQiOiLQsNGB0YHQsNC70LDQvCDQsNC70LXQudC60YPQvCDQsdGA0LDRgiEg0LrQsNC6INGC0LLQvtC4INC00LXQu9CwID8ifQ=="
      );

      script.onload = () => console.log("FlowXO widget loaded");
      script.onerror = () => console.error("Error loading FlowXO widget");

      document.body.appendChild(script);
    }
  };

  // Функция для удаления виджета
  const removeWidget = () => {
    const widgetFrame = document.querySelector("iframe[src*='flowxo']");
    if (widgetFrame) {
      widgetFrame.parentNode.removeChild(widgetFrame);
    }

    const script = document.querySelector(`#fxo-widget-script`);
    if (script) {
      script.remove();
    }
  };

  // Функция для обработки нажатия на кнопку "Позвать помощника"
  const handleCallAssistant = () => {
    setShowButton(false); // Прячем кнопку
    window.location.reload(); // Перезагружаем страницу
  };

  // Отображаем кнопку только если пользователь вернулся на страницу
  useEffect(() => {
    // После перехода на другие страницы и возвращения на /contacts, кнопка должна появиться
    setShowButton(true);
  }, []);


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

  const handleContextMenu = (event) => {
    event.preventDefault();
  }

  return (
<div className="cont-body" onContextMenu={handleContextMenu}>
      {/* Theme Toggle */}
      <div className="cont-theme-toggle" id="theme-toggle">
        <div className="cont-toggle-circle"></div>
      </div>

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
          <ul style={{color: "#58a6ff", fontSize: "25px"}}>Контакты</ul>
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

        <ul className="logo-app" style={{color: "#58a6ff", fontSize: "25px"}}>Контакты</ul>

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
           <li><Link to="/schedule"><FontAwesomeIcon icon={faCalendarAlt} /> Расписание</Link></li>
           <li><Link to="/library"><FontAwesomeIcon icon={faBook} /> Библиотека</Link></li>
           <li><Link to="/contacts"><FontAwesomeIcon icon={faPhone} style={{color: "red"}} /> Контакты</Link></li>
           <li><Link to="/authdetails"><FontAwesomeIcon icon={faUserCog} /> Настройки Профиля</Link></li>
        </ul>
        </div>

        </div>
      </header>

      <div className="cont-header">
        <div className="cont-container">
          <h1 style={{marginLeft: "75px"}}>Контакты</h1>
        </div>
{showButton && (
  <button onClick={handleCallAssistant} style={{width: "100px", marginRight: "15px"}}>
     Помощник
  </button>
)}
      </div>

      <div className="cont-tors">
        <main>
          <section className="cont-contact-section">
            <div className="cont-container">
              <h2>Свяжитесь с нами</h2>
              <p>Мы всегда рады помочь вам.</p>
              <div className="cont-content">
                <div className="cont-form-container">
                  <form id="contactForm">
                    <div className="cont-form-group">
                      <label htmlFor="name">Ваше имя</label>
                      <input
                        type="text"
                        id="name"
                        placeholder="Введите ваше имя"
                        required
                      />
                    </div>
                    <div className="cont-form-group">
                      <label htmlFor="email">Электронная почта</label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Введите ваш email"
                        required
                      />
                    </div>
                    <div className="cont-form-group">
                      <label htmlFor="message">Сообщение</label>
                      <textarea
                        id="message"
                        placeholder="Напишите сообщение"
                        rows="5"
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="cont-btn">
                      Отправить
                    </button>
                  </form>
                </div>
                <div className="cont-info-container">
                  <h3>Наш Университет</h3>
                  <p>
                    Улица Кибербезопасности 123<br />
                    Душанбе, Таджикистан
                  </p>
                  <p>Email: info@cyberfaculty.tj<br />Телефон: +992 908 06 04 04</p>
                </div>
              </div>
            </div>
          </section>

                  {/* Map Section */}
        <section className="cont-map-section">
            <h2>Найдите нас</h2>
            <div className="cont-map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1111.964702339398!2d68.75871108036485!3d38.57296072697182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b5d1df27fb072b%3A0x4ee7aef3c6a5ff2a!2sFakul&#39;tet%20Informatsionno%20Kommunikatsionnykh%20Tekhnologiy%20Ttu%20Im%20Akademika%20M.%20S.%20Osimi!5e1!3m2!1snl!2s!4v1732189674782!5m2!1snl!2s"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
        </section>
        </main>
      </div>

      <footer>
        <p>&copy; 2024 Факультет Кибербезопасности. Все права защищены.</p>
      </footer>

      <div className="footer-nav">
        <Link to="/home"><FontAwesomeIcon icon={faHome} className="footer-icon" /></Link>
        <Link to="/searchpage"><FontAwesomeIcon icon={faSearch} className="footer-icon" /></Link>
        <Link to="/post"><FaPlusCircle className="footer-icon" /></Link>
        <Link to="/library"><FontAwesomeIcon icon={faBook} className="footer-icon" /></Link>
        <Link to="/myprofile">
          <img src={userAvatarUrl} alt="User Avatar" className="footer-avatar" />
        </Link>
      </div>
    </div>
  );
};

export default ContactsPage;