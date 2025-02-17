// LibraryPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaBook, FaChalkboardTeacher, FaSearch } from 'react-icons/fa';

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [books] = useState([
    { id: 1, title: 'Война и мир', author: 'Лев Толстой' },
    { id: 2, title: '1984', author: 'Джордж Оруэлл' },
    { id: 3, title: 'Убить пересмешника', author: 'Харпер Ли' },
    { id: 4, title: 'Гарри Поттер и философский камень', author: 'Дж.К. Роулинг' },
    { id: 5, title: 'Мастер и Маргарита', author: 'Михаил Булгаков' },
    // Добавьте другие книги по вашему желанию
  ]);

  // Варианты анимации для шапки
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

  // Фильтруем книги по поисковому запросу
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="library-container">
      {/* Анимированная шапка */}
      <motion.header 
        variants={headerVariants} 
        initial="hidden" 
        animate="visible" 
        className="header-lc"
      >
        <div className="logo-lc">Библиотека</div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Поиск книг..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <FaSearch className="search-icon" />
        </div>
      </motion.header>

      {/* Список книг */}
      <div className="book-list">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.id} className="book-item">
              <h2>{book.title}</h2>
              <p>{book.author}</p>
            </div>
          ))
        ) : (
          <p>Книги не найдены.</p>
        )}
      </div>

      <motion.nav 
        variants={navbarVariants} 
        initial="hidden" 
        animate="visible" 
        className="navbar"
      >
        <a href="#welcomepage">
          <FaHome /> Главная
        </a>
        <a href="#library">
          <FaBook /> Библиотека
        </a>
        <a href="#teachers">
          <FaChalkboardTeacher /> Преподаватели
        </a>
      </motion.nav>
    </div>
  );
};

export default LibraryPage;