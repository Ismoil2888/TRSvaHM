import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref as dbRef, push, set, get, update, remove, onValue } from "firebase/database";
import { uploadBytesResumable } from "firebase/storage";
import { auth } from "../firebase";
import bookIcon from '../book-icon.png';
import editIcon from '../edit-icon.png';
import "../TeacherProfile.css";
import defaultAvatar from "../default-image.png";
import { FiHome, FiUser, FiArrowLeft, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import ttulogo from "../Ttulogo.png";
// import { CiTextAlignCenter } from 'react-icons/ci';

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
  const [userRole, setUserRole] = useState('');
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', description: '', file: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVideos, setShowVideos] = useState(false);
  const [videos, setVideos] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        setUserRole(userData?.role || '');
      });
    }
  }, [database]);

  // Список кафедр
  const departments = [
    "Системахои Автоматикунонидашудаи Идоракуни",
    "Шабакахои Алока Ва Системахои Комутатсиони",
    "Технологияхои Иттилооти Ва Хифзи Маълумот",
    "Автоматонии Равандхои Технологи Ва Истехсолот",
    "Информатика Ва Техникаи Хисоббарор"
  ];

  // Обработчик отправки уведомления
  const handleSendNotification = async () => {
    if (!message || !audience || (audience === 'department' && !selectedDepartment)) {
      alert('Заполните все обязательные поля!');
      return;
    }

    const db = getDatabase();
    const usersRef = dbRef(db, 'users');

    try {
      // Получаем всех пользователей
      const snapshot = await get(usersRef);
      const allUsers = snapshot.val();
      const receivers = [];

      // Фильтруем получателей
      Object.keys(allUsers).forEach(userId => {
        const user = allUsers[userId];
        switch (audience) {
          case 'all':
            receivers.push(userId);
            break;
          case 'teachers':
            if (user.role === 'teacher') receivers.push(userId);
            break;
          case 'department':
            if (user.role === 'teacher' && user.cathedra === selectedDepartment) {
              receivers.push(userId);
            }
            break;
        }
      });

      // Создаем объект уведомления
      const notification = {
        type: 'dean_notification',
        message: message,
        deanName: `${teacher.name} ${teacher.surname}`,
        deanAvatar: teacher.photo || defaultAvatar,
        timestamp: new Date().toISOString(),
      };

      // Отправляем каждому получателю
      receivers.forEach(userId => {
        const userNotificationsRef = dbRef(db, `notifications/${userId}`);
        push(userNotificationsRef, notification);
      });

      // Сброс формы и уведомление
      setMessage('');
      setAudience('');
      setSelectedDepartment('');
      showNotification('Уведомление успешно отправлено!');
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      alert('Произошла ошибка при отправке уведомления');
    }
  };

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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const videosRef = dbRef(database, `users/${user.uid}/videos`);
      onValue(videosRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedVideos = Object.keys(data).map(videoId => ({
            id: videoId,
            ...data[videoId]
          }));
          setVideos(loadedVideos);
        }
      });
    }
  }, [database]);

  // 3. Хук загрузки видео с прогрессом
  const handleUploadVideoLesson = async () => {
    if (!newVideo.title || !newVideo.description) return;
    setUploading(true);
  
    try {
      let url = editingVideo?.url || '';
      let storagePath = editingVideo?.storagePath || '';
  
      // Если выбран новый файл — загружаем и заменяем
      if (newVideo.file) {
        const storageReference = storageRef(storage, `videos/${newVideo.file.name}`);
        const uploadTask = uploadBytesResumable(storageReference, newVideo.file);
        await new Promise((resolve, reject) => {
          uploadTask.on("state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error("Ошибка загрузки:", error);
              reject(error);
            },
            async () => {
              url = await getDownloadURL(uploadTask.snapshot.ref);
              storagePath = uploadTask.snapshot.ref.fullPath;
              resolve();
            }
          );
        });
      }
  
      const videoData = {
        title: newVideo.title,
        description: newVideo.description,
        url,
        storagePath,
        cathedra: teacher.cathedra,
        author: `${teacher.name} ${teacher.surname}`,
        timestamp: new Date().toISOString(),
      };
  
      const db = getDatabase();
      const user = auth.currentUser;
  
      if (editingVideo) {
        // 🔁 Обновляем существующую запись в users
        await update(dbRef(db, `users/${user.uid}/videos/${editingVideo.id}`), videoData);
  
        // 🔁 Обновляем в videoLessons по совпадению url
        const lessonsRef = dbRef(db, 'videoLessons');
        onValue(lessonsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.entries(data).forEach(([key, val]) => {
              if (val.url === editingVideo.url) {
                update(dbRef(db, `videoLessons/${key}`), videoData);
              }
            });
          }
        }, { onlyOnce: true });
  
        showNotification("Видео успешно обновлено!");
      } else {
        // 🆕 Добавляем новое видео
        await push(dbRef(db, 'videoLessons'), videoData);
        await push(dbRef(db, `users/${user.uid}/videos`), videoData);
        showNotification("Видео успешно загружено!");
      }
  
      setUploading(false);
      setUploadProgress(0);
      setNewVideo({ title: '', description: '', file: null });
      setShowVideoForm(false);
      setEditingVideo(null);
    } catch (err) {
      console.error(err);
      alert("Ошибка при загрузке/обновлении видео");
      setUploading(false);
    }
  };  

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setNewVideo({ title: video.title, description: video.description, file: null });
    setShowVideoForm(true);
  };

  const handleDeleteVideo = async (video) => {
    if (window.confirm('Вы уверены, что хотите удалить этот видеоурок?')) {
      try {
        // Удаляем файл из хранилища
        const videoRef = storageRef(storage, video.storagePath);
        await deleteObject(videoRef);
  
        // Удаляем из users/UID/videos
        const userVideoRef = dbRef(database, `users/${auth.currentUser.uid}/videos/${video.id}`);
        await remove(userVideoRef);
  
        // Удаляем из глобального videoLessons по совпадению URL
        const lessonsRef = dbRef(database, 'videoLessons');
        onValue(lessonsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.entries(data).forEach(([key, val]) => {
              if (val.url === video.url) {
                remove(dbRef(database, `videoLessons/${key}`));
              }
            });
          }
        }, { onlyOnce: true });
  
        // Удаляем из локального состояния мгновенно
        setVideos(prev => prev.filter(v => v.id !== video.id));
  
        showNotification('Видеоурок успешно удален.');
      } catch (error) {
        console.error("Ошибка при удалении видеоурока: ", error);
        alert("Ошибка при удалении видеоурока.");
      }
    }
  };  

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
            <FiUser className="menu-icon" style={{ color: "lightgreen" }} />
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
        <Link className="tch-profile-back-button" onClick={() => navigate(-1)}>
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

          {/* Форма для декана */}
          {userRole === 'dean' && (
            <div className="dean-notification-form">
              <h3>Отправка официального уведомления</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Текст уведомления..."
                className="dean-textarea"
              />

              <div className="audience-selector">
                <button
                  onClick={() => setAudience('all')}
                  className={audience === 'all' ? 'active' : ''}
                >
                  Всем пользователям
                </button>

                <button
                  onClick={() => setAudience('teachers')}
                  className={audience === 'teachers' ? 'active' : ''}
                >
                  Всем преподавателям
                </button>

                <button
                  onClick={() => setAudience('department')}
                  className={audience === 'department' ? 'active' : ''}
                >
                  Кафедре
                </button>
              </div>

              {audience === 'department' && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="department-select"
                >
                  <option value="">Выберите кафедру</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              )}

              <button
                onClick={handleSendNotification}
                className="send-notification-btn"
              >
                Отправить уведомление
              </button>
            </div>
          )}

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

            <button className="upload-book-button" onClick={() => setShowVideoForm(true)}>Опубликовать видеоурок</button>
            <button onClick={() => setShowVideos(!showVideos)} className="upload-book-button">
              {showVideos ? 'Скрыть мои видеоуроки' : 'Показать мои видеоуроки'}
            </button>


            {showVideoForm && (
              <div className="modal">
                <div className="modal-content">
                <h3>{editingVideo ? 'Редактировать видеоурок' : 'Новый видеоурок'}</h3>
                  <input
                    type="text"
                    placeholder="Название видеоурока"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Описание видеоурока"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="video/mp4"
                    onChange={(e) => setNewVideo({ ...newVideo, file: e.target.files[0] })}
                  />
                  {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
                  <div className="modal-buttons">
                    <button onClick={handleUploadVideoLesson} disabled={uploading}>
                      {uploading ? `Загрузка ${uploadProgress}%` : 'Опубликовать'}
                    </button>
                    <button onClick={() => setShowVideoForm(false)}>Отмена</button>
                  </div>
                </div>
              </div>
            )}

            {showVideos && (
              <div className="videos-list">
                {videos.map((video) => (
                  <div key={video.id} className="video-item">
                    <h4>{video.title}</h4>
                    <p>{video.description}</p>
                    <video width="320" height="240" controls>
                      <source src={video.url} type="video/mp4" />
                      Ваш браузер не поддерживает видео тег.
                    </video>
                    <button onClick={() => handleEditVideo(video)}>Редактировать</button>
                    <button onClick={() => handleDeleteVideo(video)}>Удалить</button>
                  </div>
                ))}
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