import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref as dbRef, push, set, update, remove, onValue } from "firebase/database";
import bookIcon from '../book-icon.png'; // Иконка для книг
import editIcon from '../edit-icon.png'; // Иконка для редактирования (карандаш)
import "../TeacherProfile.css";
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
    <div className="tch-profile-container">
      <h2 style={{ color: "grey" }}>Личный кабинет преподавателя</h2>
      <div className="tch-profile-info-books-list">
      <div className="tch-profile-info">
        <img
          src={teacher.photo || 'default-photo-url.jpg'}
          alt={`${teacher.name} ${teacher.surname}`}
        />
        <p><strong>Имя:</strong> {teacher.name}</p>
        <p><strong>Фамилия:</strong> {teacher.surname}</p>
        <p><strong>Предмет:</strong> {teacher.subject}</p>
        <p><strong>Статус:</strong> {teacher.status}</p>
        <p><strong>Логин:</strong> {teacher.login}</p>
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

      {/* Уведомление */}
      {notification && <div className="notification">{notification}</div>}
      </div>
    </div>
  );
};

export default TeacherProfile;

















//оригинал
// import React, { useState, useEffect } from 'react';
// import { useLocation, useParams } from 'react-router-dom';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import { getDatabase, ref as dbRef, push, set, update, remove, onValue } from "firebase/database";
// import bookIcon from '../book-icon.png'; // Иконка для книг
// import editIcon from '../edit-icon.png'; // Иконка для редактирования (карандаш)
// import "../TeacherProfile.css";
// import { CiTextAlignCenter } from 'react-icons/ci';

// const TeacherProfile = () => {
//   const { state } = useLocation();
//   const { teacher } = state || {};
//   const { id } = useParams();

//   const [books, setBooks] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingBook, setEditingBook] = useState(null);
//   const [newBook, setNewBook] = useState({ title: '', description: '', file: null });
//   const [uploading, setUploading] = useState(false);
//   const [showBooks, setShowBooks] = useState(false); // Для управления видимостью списка книг
//   const [notification, setNotification] = useState(null); // Уведомления

//   const storage = getStorage();
//   const database = getDatabase();

//   useEffect(() => {
//     // Получение списка книг преподавателя из Firebase
//     const booksRef = dbRef(database, `teachers/${id}/books`);
//     onValue(booksRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedBooks = Object.keys(data).map(bookId => ({ id: bookId, ...data[bookId] }));
//         setBooks(loadedBooks);
//       }
//     });
//   }, [database, id]);

//   const handleUploadBook = async () => {
//     if (newBook.title && newBook.description && (newBook.file || editingBook)) {
//       setUploading(true);

//       let fileURL = editingBook ? editingBook.fileURL : '';
//       if (newBook.file) {
//         const fileRef = storageRef(storage, `books/${newBook.file.name}`);
//         await uploadBytes(fileRef, newBook.file);
//         fileURL = await getDownloadURL(fileRef);
//       }

//       const bookData = {
//         title: newBook.title,
//         description: newBook.description,
//         fileURL
//       };

//       if (editingBook) {
//         // Обновляем существующую книгу
//         const bookRef = dbRef(database, `teachers/${id}/books/${editingBook.id}`);
//         await update(bookRef, bookData);
//         showNotification('Книга успешно обновлена.');
//       } else {
//         // Добавляем новую книгу
//         const booksRef = dbRef(database, `teachers/${id}/books`);
//         await set(push(booksRef), bookData);
//         showNotification('Книга успешно загружена.');
//       }

//       setNewBook({ title: '', description: '', file: null });
//       setIsModalOpen(false);
//       setEditingBook(null);
//       setUploading(false);
//     }
//   };

//   const handleEditBook = (book) => {
//     setEditingBook(book);
//     setNewBook({ title: book.title, description: book.description, file: null });
//     setIsModalOpen(true);
//   };

//   const handleDeleteBook = async (book) => {
//     if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
//       try {
//         // Извлекаем правильный путь к файлу из URL файла
//         const fileRef = storageRef(storage, `books/${decodeURIComponent(book.fileURL.split('%2F').pop().split('?')[0])}`);
//         await deleteObject(fileRef);

//         const bookRef = dbRef(database, `teachers/${id}/books/${book.id}`);
//         await remove(bookRef);
//         showNotification('Книга успешно удалена.');
//       } catch (error) {
//         console.error("Ошибка при удалении книги: ", error);
//         alert("Ошибка при удалении книги. Файл не найден.");
//       }
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(null), 3000); // Убираем уведомление через 3 секунды
//   };

//   if (!teacher) {
//     return <p>Преподаватель с таким ID не найден.</p>;
//   }

//   return (
//     <div className="tch-profile-container">
//       <h2 style={{ color: "grey" }}>Личный кабинет преподавателя</h2>
//       <div className="tch-profile-info-books-list">
//       <div className="tch-profile-info">
//         <img
//           src={teacher.photo || 'default-photo-url.jpg'}
//           alt={`${teacher.name} ${teacher.surname}`}
//         />
//         <p><strong>Имя:</strong> {teacher.name}</p>
//         <p><strong>Фамилия:</strong> {teacher.surname}</p>
//         <p><strong>Предмет:</strong> {teacher.subject}</p>
//         <p><strong>Статус:</strong> {teacher.status}</p>
//         <p><strong>Логин:</strong> {teacher.login}</p>
//       </div>


//      <div className="spisok-button-block">
//       <button onClick={() => setShowBooks(!showBooks)} className="toggle-books-button">
//         {showBooks ? 'Скрыть список книг' : 'Список загруженных книг в библиотеке'}
//       </button>

//       {showBooks && (
//         <div className="books-list-container">
//           <div className="books-list">
//             {books.map((book) => (
//               <div key={book.id} className="book-item">
//                 <img src={bookIcon} alt="Иконка книги" className="book-icon" />
//                 <div className="book-info">
//                   <h4>{book.title}</h4>
//                   <p>{book.description}</p>
//                 </div>
//                 <img
//                   src={editIcon}
//                   alt="Редактировать книгу"
//                   className="edit-book-icon"
//                   onClick={() => handleEditBook(book)}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <button onClick={() => setIsModalOpen(true)} className="upload-book-button">Загрузить книгу</button>

//       {/* Модальное окно для загрузки или редактирования книги */}
//       {isModalOpen && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>{editingBook ? 'Редактировать книгу' : 'Загрузить новую книгу'}</h3>
//             <input
//               type="text"
//               placeholder="Название книги"
//               value={newBook.title}
//               onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
//             />
//             <textarea
//               placeholder="Описание книги"
//               value={newBook.description}
//               onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
//             />
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={(e) => setNewBook({ ...newBook, file: e.target.files[0] })}
//             />
//             <div className="modal-buttons">
//               <button onClick={handleUploadBook} disabled={uploading}>
//                 {uploading ? 'Загрузка...' : editingBook ? 'Обновить' : 'Загрузить'}
//               </button>
//               {editingBook && (
//                 <button className="delete-button" onClick={() => handleDeleteBook(editingBook)}>
//                   Удалить
//                 </button>
//               )}
//               <button onClick={() => setIsModalOpen(false)}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}
//       </div>

//       {/* Уведомление */}
//       {notification && <div className="notification">{notification}</div>}
//       </div>
//     </div>
//   );
// };

// export default TeacherProfile;