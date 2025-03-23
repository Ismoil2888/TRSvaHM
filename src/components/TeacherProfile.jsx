import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref as dbRef, push, set, update, remove, onValue } from "firebase/database";
import bookIcon from '../book-icon.png'; // Иконка для книг
import editIcon from '../edit-icon.png'; // Иконка для редактирования (карандаш)
import "../TeacherProfile.css";
import defaultAvatar from "../default-image.png";
import { FiHome, FiUser, FiArrowLeft, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import ttulogo from "../Ttulogo.png";
import { CiTextAlignCenter } from 'react-icons/ci';

const TeacherProfile = () => {
  const { state } = useLocation();
  const { teacher } = state || {};
  const { id } = useParams();
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [showBooks, setShowBooks] = useState(false); // Для управления видимостью списка книг
  const [notification, setNotification] = useState(null); // Уведомления
  const storage = getStorage();
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
    marginLeft: isMenuOpen ? "250px" : "0px",
    transition: "margin 0.3s ease",
  };

  useEffect(() => {
    // Получение списка книг преподавателя из Firebase
    const booksRef = dbRef(database, `teachers/${id}/books`);
    onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedBooks = Object.keys(data).map(bookId => ({ id: bookId, ...data[bookId] }));
        setBooks(loadedBooks);
      }
    });
  }, [database, id]);

  const handleUploadBook = async () => {
    if (newBook.title && newBook.description && (newBook.file || editingBook)) {
      setUploading(true);

      let fileURL = editingBook ? editingBook.fileURL : '';
      if (newBook.file) {
        const fileRef = storageRef(storage, `books/${newBook.file.name}`);
        await uploadBytes(fileRef, newBook.file);
        fileURL = await getDownloadURL(fileRef);
      }

      const bookData = {
        title: newBook.title,
        description: newBook.description,
        fileURL
      };

      if (editingBook) {
        // Обновляем существующую книгу
        const bookRef = dbRef(database, `teachers/${id}/books/${editingBook.id}`);
        await update(bookRef, bookData);
        showNotification('Книга успешно обновлена.');
      } else {
        // Добавляем новую книгу
        const booksRef = dbRef(database, `teachers/${id}/books`);
        await set(push(booksRef), bookData);
        showNotification('Книга успешно загружена.');
      }

      setNewBook({ title: '', description: '', file: null });
      setIsModalOpen(false);
      setEditingBook(null);
      setUploading(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setNewBook({ title: book.title, description: book.description, file: null });
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (book) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      try {
        // Извлекаем правильный путь к файлу из URL файла
        const fileRef = storageRef(storage, `books/${decodeURIComponent(book.fileURL.split('%2F').pop().split('?')[0])}`);
        await deleteObject(fileRef);

        const bookRef = dbRef(database, `teachers/${id}/books/${book.id}`);
        await remove(bookRef);
        showNotification('Книга успешно удалена.');
      } catch (error) {
        console.error("Ошибка при удалении книги: ", error);
        alert("Ошибка при удалении книги. Файл не найден.");
      }
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000); // Убираем уведомление через 3 секунды
  };

  if (!teacher) {
    return <p>Преподаватель с таким ID не найден.</p>;
  }

  return (
    <div className="glva">
      <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img style={{ width: "50px", height: "45px" }} src={ttulogo} alt="" />
          {isMenuOpen ? (
            <>
              <h2>TTU</h2>
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
            <FiHome className="menu-icon" />
            {isMenuOpen && <span>Главная</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/searchpage" className="menu-item">
              <FiSearch className="menu-icon" />
              {isMenuOpen && <span>Поиск</span>}
            </Link>
            <Link to="/teachers" className="menu-item">
              <FiUserCheck className="menu-icon" />
              {isMenuOpen && <span>Преподаватели</span>}
            </Link>
            <Link to="/library" className="menu-item">
              <FiBookOpen className="menu-icon" />
              {isMenuOpen && <span>Библиотека</span>}
            </Link>
          </div>
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" style={{ borderBottom: "1px solid rgb(255, 255, 255)", borderRadius: "15px", padding: "5px" }} />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/chats" className="menu-item">
              <FiMessageSquare className="menu-icon" />
              {isMenuOpen && <span>Сообщения</span>}
            </Link>
            <Link to="/notifications" className="menu-item">
              <FiBell className="menu-icon" />
              {isMenuOpen && <span>Уведомления</span>}
            </Link>
          </div>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" />
            {isMenuOpen && <span>Настройки</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
          TRSvaHM
          {isMenuOpen &&
            <div>
              <p>&copy; 2025 Все права защищены.</p>
            </div>
          }
        </div>
      </div>
      <div className="tch-profile-container" style={mainContentStyle}>
        <Link className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </Link>
        <h2>Личный кабинет преподавателя</h2>
        <div className="tch-profile-info-books-list">
          <div className="tch-profile-info">
            <div className="teach-img-name-surname">
              <img
                src={teacher.photo || defaultAvatar}
                alt={`${teacher.name}`}
              />
              <p> {teacher.name} {teacher.surname}</p>
            </div>
            <p><strong>Предмет:</strong> {teacher.subject}</p>
            <p><strong>Кафедра:</strong> {teacher.cathedra}</p>
            <p><strong>Звание:</strong> {teacher.runk}</p>
            <p><strong>Логин:</strong> {teacher.email}</p>
          </div>

          <div className="spisok-button-block">
            <button onClick={() => setShowBooks(!showBooks)} className="toggle-books-button">
              {showBooks ? 'Скрыть список книг' : 'Список загруженных книг в библиотеке'}
            </button>

            {showBooks && (
              <div className="books-list-container">
                <div className="books-list">
                  {books.map((book) => (
                    <div key={book.id} className="book-item">
                      <img src={bookIcon} alt="Иконка книги" className="book-icon" />
                      <div className="book-info">
                        <h4>{book.title}</h4>
                        <p>{book.description}</p>
                      </div>
                      <img
                        src={editIcon}
                        alt="Редактировать книгу"
                        className="edit-book-icon"
                        onClick={() => handleEditBook(book)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setIsModalOpen(true)} className="upload-book-button">Загрузить книгу</button>

            {/* Модальное окно для загрузки или редактирования книги */}
            {isModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <h3>{editingBook ? 'Редактировать книгу' : 'Загрузить новую книгу'}</h3>
                  <input
                    type="text"
                    placeholder="Название книги"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Описание книги"
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setNewBook({ ...newBook, file: e.target.files[0] })}
                  />
                  <div className="modal-buttons">
                    <button onClick={handleUploadBook} disabled={uploading}>
                      {uploading ? 'Загрузка...' : editingBook ? 'Обновить' : 'Загрузить'}
                    </button>
                    {editingBook && (
                      <button className="delete-button" onClick={() => handleDeleteBook(editingBook)}>
                        Удалить
                      </button>
                    )}
                    <button onClick={() => setIsModalOpen(false)}>Отмена</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Уведомление */}
        {notification && <div className="notification">{notification}</div>}
      </div>
    </div>
  );
};

export default TeacherProfile;