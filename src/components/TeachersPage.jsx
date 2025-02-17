// TeachersPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaBook, FaChalkboardTeacher, FaSearch } from 'react-icons/fa';

// Данные преподавателей
const teachers = [
  {
    id: 1,
    name: 'Кудрали',
    surname: 'Амбарович',
    subject: 'Математика',
    image: 'https://via.placeholder.com/150', // Замените на реальные изображения
  },
  {
    id: 2,
    name: 'Амирхон',
    surname: 'Петров',
    subject: 'Физика',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    name: 'Екатерина',
    surname: 'Ширинбекова',
    subject: 'История',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 4,
    name: 'Дмитрий',
    surname: 'Курбонов',
    subject: 'Химия',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 5,
    name: 'Ольга',
    surname: 'Хочаназарова',
    subject: 'Литература',
    image: 'https://via.placeholder.com/150',
  },
];

const navbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 2,
      y: 0,
      transition: { duration: 0.8, type: 'spring', stiffness: 80 },
    },
  };

const TeachersPage = () => {
  return (
    <div className="teachers-container">
      <h1 className="page-title">Преподаватели</h1>
      <div className="teachers-list">
        {teachers.map(teacher => (
          <motion.div 
            key={teacher.id} 
            className="teacher-card"
            whileHover={{ scale: 1.05 }} // Анимация при наведении
          >
            <img src={teacher.image} alt={`${teacher.name} ${teacher.surname}`} className="teacher-image" />
            <h2 className="teacher-name">{`${teacher.name} ${teacher.surname}`}</h2>
            <p className="teacher-subject">{teacher.subject}</p>
          </motion.div>
        ))}
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

export default TeachersPage;