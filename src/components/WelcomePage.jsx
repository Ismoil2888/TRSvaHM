import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ttulogo from "../Ttulogo.png";
import basiclogo from "../basic-logo.png";
import "../WelcomePage.css";
import ttustudents3 from "../ttustudents3.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { RiTranslate2 } from "react-icons/ri";
import { FcCollaboration, FcLibrary, FcPlanner, FcGraduationCap } from "react-icons/fc";
import { FiUser } from "react-icons/fi";
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../translations';
import useTranslation from '../hooks/useTranslation';
// Вспомогательный компонент для карточек
const Card = ({ image, title, description }) => (
  <motion.div
    className="card"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    {image && <img src={image} alt={title} className="card-image" />}
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.div>
);

const WelcomePage = () => {
  const [activeTab, setActiveTab] = useState("Факултет");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDept, setOpenDept] = useState(null); // для раскрытия специальностей в Бакалавриате
  const t = useTranslation();
    const { handleLanguageChange } = useContext(LanguageContext);
  // Состояния для темы и языка
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'standard');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'russian');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const tabs = [
    { label: "Факултет" },
    { label: "Бакалавриат" },
    { label: "Ҷадвали дарсҳо" },
    { label: "Китобхонаи электронӣ" },
    { label: "Тамос" },
  ];

  // Объект с содержимым вкладок
  const tabContents = {
    "Факултет": (
      <div>
        <h2 className="txt">{t('facultname')}</h2>
        <p>
          Наш факультет – это гарантия востребованности специалистов в области информационной безопасности. Учитесь у нас и получите практические навыки, востребованные ведущими мировыми компаниями, такими как Google, Apple и Amazon. Наши выпускники успешно строят карьеру в сфере информационной безопасности, ИТ-инженерии и системного администрирования.
        </p>
        <div className="wp-cards-grid">
          <Card
            image={ttulogo}
            title="Высокий спрос"
            description="Специалисты по ИБ, подготовленные у нас, востребованы на мировом рынке."
          />
          <Card
            image={basiclogo}
            title="Практические навыки"
            description="Современные лаборатории и реальные проекты помогают освоить технологии."
          />
          <Card
            image={ttulogo}
            title="Успешная карьера"
            description="Большинство выпускников работают в лидирующих компаниях мира."
          />
          <Card
            image={ttulogo}
            title="Инновационные методики"
            description="Наши программы соответствуют мировым стандартам образования в ИБ."
          />
        </div>
      </div>
    ),
    "Бакалавриат": (
      <div>
        <h2 style={{ color: "grey" }}>Бакалавриат</h2>
        <p>
          Наши бакалаврские программы – это комплексное образование, ориентированное на практику и инновации. Мы предлагаем курсы, сочетающие теорию с практическими заданиями, чтобы вы были готовы к современным требованиям рынка труда.
        </p>
        <div className="wp-cards-grid">
          <FcGraduationCap style={{ fontSize: "250px" }} />
          <Card
            image={basiclogo}
            title="Актуальные программы"
            description="Учебные курсы, разработанные с ведущими экспертами отрасли."
          />
          <Card
            image={ttulogo}
            title="Практическое обучение"
            description="Лабораторные занятия и проекты, позволяющие применить знания на практике."
          />
          <Card
            image={basiclogo}
            title="Перспективы карьеры"
            description="Выпускники востребованы в различных сферах ИТ и бизнеса."
          />
        </div>
        {/* Блок с кафедрами */}
        <div className="departments-section">
          <h3>Наши кафедры факультета</h3>
          <p>
            Факультет включает 5 кафедр из 11 специальностей, каждая из которых направлена на ключевые направления образования:
          </p>
          <div className="departments-grid">
            {[
              "Системахои Автоматикунонидашудаи Идоракуни",
              "Шабакахои Алока Ва Системахои Комутатсиони",
              "Технологияхои Иттилооти Ва Хифзи Маълумот",
              "Автоматонии Равандхои Технологи Ва Истехсолот",
              "Информатика Ва Техникаи Хисоббарор",
            ].map((dept) => (
              <motion.div
                key={dept}
                className="department-block"
                onClick={() => setOpenDept(openDept === dept ? null : dept)}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {dept}
                {/* Анимация раскрытия списка специальностей */}
                <AnimatePresence>
                  {openDept === dept && (
                    <motion.div
                      className="specialties-dropdown"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="specialties-grid">
                        {(() => {
                          // Распределение специальностей по кафедрам
                          const departmentSpecialties = {
                            "Системахои Автоматикунонидашудаи Идоракуни": ["1-400101 - ТБТИ", "1-530102 - АСКИ"],
                            "Шабакахои Алока Ва Системахои Комутатсиони": ["1-450103-02 - ШАваТИ"],
                            "Технологияхои Иттилооти Ва Хифзи Маълумот": ["1-400102-04 - ТИваХМ", "1-98010101-03 - ТИваХМ", "1-98010101-05 - ТИваХМ"],
                            "Автоматонии Равандхои Технологи Ва Истехсолот": ["1-530101 - АРТваИ", "1-530107 - АРТваИ", "1-400301-02 - АРТваИ", "1-400301-05 - АРТваИ"],
                            "Информатика Ва Техникаи Хисоббарор": ["1-080101-07 - ИваТХ"],
                          };
                          return departmentSpecialties[dept].map((spec) => (
                            <div key={spec} className="specialty-block">
                              {spec}
                            </div>
                          ));
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          {/* Регистрационный блок с анимацией */}
          <motion.div
            className="signup-cta"
            style={{ marginTop: "20px" }}
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/signup" style={{ color: "white" }} className="wp-login">
              <p>Зарегистрироваться сейчас!</p>
              <FiUser />
            </Link>
          </motion.div>
        </div>
      </div>
    ),
    "Ҷадвали дарсҳо": (
      <div>
        <h2 style={{ color: "grey" }}>Ҷадвали дарсҳо</h2>
        <p>
          Наш раздел расписания – это интуитивно понятный инструмент для планирования учебного процесса. Всегда будьте в курсе новостей, уроков, преподавателей и расписания занятий, регистрируясь на нашей платформе!
        </p>
        <div className="wp-cards-grid">
          <FcPlanner style={{ fontSize: "250px" }} />
          <Card
            image={basiclogo}
            title="Удобное расписание"
            description="Интерактивное расписание помогает легко планировать ваше время."
          />
          <Card
            image={ttulogo}
            title="Актуальные обновления"
            description="Все изменения мгновенно отображаются на платформе."
          />
          <Card
            image={basiclogo}
            title="Простота использования"
            description="Дружелюбный интерфейс для быстрого поиска информации."
          />
        </div>
      </div>
    ),
    "Китобхонаи электронӣ": (
      <div>
        <h2 style={{ color: "grey" }}>Китобхонаи электронӣ</h2>
        <p>
          Получите неограниченный доступ к богатейшей электронной библиотеке. Зарегистрировавшись на платформе, вы сможете читать и скачивать множество интересных книг и учебных материалов для самообразования и профессионального роста.
        </p>
        <div className="wp-cards-grid">
          <FcLibrary style={{ fontSize: "250px" }} />
          <Card
            image={ttustudents3}
            title="Богатая коллекция"
            description="Тысячи книг и журналов из разных областей знаний ждут вас."
          />
          <Card
            image={ttustudents3}
            title="Удобный поиск"
            description="Легко находите нужную литературу с помощью нашего удобного поиска."
          />
          <Card
            image={ttustudents3}
            title="Доступ 24/7"
            description="Читайте и учитесь в любое время, где бы вы ни находились."
          />
        </div>
      </div>
    ),
    "Тамос": (
      <div>
        <h2 style={{ color: "grey" }}>Тамос</h2>
        <p>
          Если у вас возникли вопросы или нужна помощь – раздел «Тамос» всегда к вашим услугам. Свяжитесь с нашей службой поддержки, и мы оперативно ответим на все запросы, чтобы вы могли сосредоточиться на учебе.
        </p>
        <div className="wp-cards-grid">
          <FcCollaboration style={{ fontSize: "250px" }} />
          <Card
            image={ttustudents3}
            title="Поддержка 24/7"
            description="Наша служба поддержки работает круглосуточно."
          />
          <Card
            image={ttustudents3}
            title="Консультации экспертов"
            description="Получите профессиональные советы от наших специалистов."
          />
          <Card
            image={ttustudents3}
            title="Быстрый отклик"
            description="Оперативно отвечаем на все ваши вопросы."
          />
        </div>
      </div>
    ),
  };

  const renderTabContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="tab-content"
      >
        {tabContents[activeTab] || (
          <div>
            <h2>{activeTab}</h2>
            <p>Содержимое раздела: {activeTab}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // Функции для выбора темы и языка
  const selectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    setShowThemeDropdown(false);
    window.location.reload();
  };

  const selectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="serious-app">
      {/* Шапка страницы */}
      <div className="serious-header">
        {/* Левый логотип – отображается только на десктопе */}
        <motion.div
          className="hp-header-logo"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: 'spring', stiffness: 80 }}
        >
          <img src={ttulogo} alt="Логотип" />
        </motion.div>
        {/* Иконка меню – отображается только на мобильных устройствах */}
        <motion.div
          className="mobile-menu-icon"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring', stiffness: 80 }}
        >
          <button onClick={() => setIsMenuOpen(true)} style={{ color: "grey", background: "none", border: "none" }}>
            <FontAwesomeIcon icon={faBars} size="1x" />
          </button>
        </motion.div>
        <motion.div
          className="hp-header-title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, type: 'spring', stiffness: 80 }}
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
          <img className='basiclogomobile' src={basiclogo} alt="Логотип 2" />
        </motion.div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="mobile-menu-header">
              <img src={ttulogo} alt="Логотип" />
              <button className="wp-close-button" onClick={() => setIsMenuOpen(false)}>✕</button>
            </div>
            <ul className="mobile-menu-list">
              {tabs.map((tab) => (
                <li
                  key={tab.label}
                  onClick={() => { setActiveTab(tab.label); setIsMenuOpen(false); }}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
            {/* Блок с настройками в мобильном меню */}
            <div className="mobile-settings-dropdowns">
              <div className="dropdown-block">
                <div className="dropdown-header" onClick={() => setShowThemeDropdown(!showThemeDropdown)}>
                  <span>Тема: {theme === 'standard' ? 'Стандартная' : theme === 'light' ? 'Светлая' : 'Темная'}</span>
                  <span className="arrow">{showThemeDropdown ? '▲' : '▼'}</span>
                </div>
                {showThemeDropdown && (
                  <div className="dropdown-list">
                    <div className="dropdown-item" onClick={() => selectTheme('standard')}>Стандартная</div>
                    <div className="dropdown-item" onClick={() => selectTheme('light')}>Светлая</div>
                    <div className="dropdown-item" onClick={() => selectTheme('dark')}>Темная</div>
                  </div>
                )}
              </div>
              <div className="dropdown-block">
                <div className="dropdown-header wp-langmenu" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                  <span>
                    <RiTranslate2 style={{ marginRight: "5px" }} />
                    Язык: {language === 'tajik' ? 'Тоҷикӣ' : language === 'russian' ? 'Русский' : 'English'}
                  </span>
                  <span className="arrow">{showLanguageDropdown ? '▲' : '▼'}</span>
                </div>
                {showLanguageDropdown && (
                  <div className="dropdown-list">
                    <div className="dropdown-item" onClick={() => handleLanguageChange('tajik')}>Тоҷикӣ</div>
                    <div className="dropdown-item" onClick={() => handleLanguageChange('russian')}>Русский</div>
                    <div className="dropdown-item" onClick={() => handleLanguageChange('english')}>English</div>
                  </div>
                )}
              </div>
            </div>
            {/* Регистрация в мобильном меню внизу */}
            <div className="mobile-registration" style={{ marginTop: "200px" }}>
              <Link to="/signup" className="wp-login">
                <motion.div
                  className="signup-cta"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p>Регистрация</p>
                  <FiUser />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Блок вкладок и настройки для десктопа (скрывается на мобильных экранах через CSS) */}
      <div className="hp-tabs">
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="tabs-nav"
        >
          {tabs.map((tab) => (
            <li
              key={tab.label}
              className={`tab-item ${activeTab === tab.label ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </li>
          ))}
        </motion.ul>
        <Link to="/signup" className="wp-login">
          <motion.div
            className="signup-cta"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p>Регистрация</p>
            <FiUser />
          </motion.div>
        </Link>
      </div>

      {/* Основной контент */}
      <main className="hp-main-content serious-content">
        <div className="content-grid">
          <div className="main-tab-content">
            {renderTabContent()}
          </div>
          <aside className="side-widgets">
            <motion.div
              className="widget widget-card blur-effect"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3>В разработке</h3>
              <p>Скоро</p>
            </motion.div>
            <motion.div
              className="widget widget-card blur-effect"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3>В разработке</h3>
              <p>Скоро</p>
            </motion.div>
            <motion.div
              className="widget widget-card blur-effect"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3>В разработке</h3>
              <p>Скоро</p>
            </motion.div>
            <div className="desktop-settings-dropdowns">
              <div className="dropdown-block">
                <div className="dropdown-header" onClick={() => setShowThemeDropdown(!showThemeDropdown)}>
                  <span>Тема: {theme === 'standard' ? 'Стандартная' : theme === 'light' ? 'Светлая' : 'Темная'}</span>
                  <span className="arrow">{showThemeDropdown ? '▲' : '▼'}</span>
                </div>
                {showThemeDropdown && (
                  <div className="dropdown-list">
                    <div className="dropdown-item" onClick={() => selectTheme('standard')}>Стандартная</div>
                    <div className="dropdown-item" onClick={() => selectTheme('light')}>Светлая</div>
                    <div className="dropdown-item" onClick={() => selectTheme('dark')}>Темная</div>
                  </div>
                )}
              </div>
              <div className="dropdown-block">
                <div className="dropdown-header wp-langmenu" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                  <span>
                    <RiTranslate2 style={{ marginRight: "5px" }} />
                    Язык: {language === 'tajik' ? 'Тоҷикӣ' : language === 'russian' ? 'Русский' : 'English'}
                  </span>
                  <span className="arrow">{showLanguageDropdown ? '▲' : '▼'}</span>
                </div>
                {showLanguageDropdown && (
                  <div className="dropdown-list">
                    <div className="dropdown-item" onClick={() => handleLanguageChange('tajik')}>Тоҷикӣ</div>
                    <div className="dropdown-item" onClick={() => handleLanguageChange('russian')}>Русский</div>
                    <div className="dropdown-item" onClick={() => handleLanguageChange('english')}>English</div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Футер */}
      <div className="hp-footer serious-footer">
        <p>
          Донишгоҳи техникии Тоҷикистон ба номи академик М.С. Осимӣ<br />
          Ҷумҳурии Тоҷикистон, 734042, ш. Душанбе, хиёбони академик Раҷабов 10
        </p>
        <p>Email: info@ttu.tj, ttu@ttu.tj</p>
        <p>+992 (372) 21-35-11 | +992 (372) 23-02-46</p>
      </div>
    </div>
  );
};

export default WelcomePage;