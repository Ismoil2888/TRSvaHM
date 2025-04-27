//упрощенка для заявки учителей
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Link, useNavigate } from "react-router-dom";
// import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getDatabase, ref as dbRef, onValue, set, get, push, update, remove } from "firebase/database";
// import imageCompression from 'browser-image-compression';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import '../AdminPanel.css';
// import '../App.css';
// import defaultAvatar from "../default-image.png";

// const AdminPanel = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [showTeachersList, setShowTeachersList] = useState(false);
//   const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
//   const [photoFile, setPhotoFile] = useState(null);
//   const [editingTeacherId, setEditingTeacherId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showRequests, setShowRequests] = useState(false);
//   const [showteacherRequests, setShowteacherRequests] = useState(false);
//   const [newRequestsCount, setNewRequestsCount] = useState(0);
//   const [requests, setRequests] = useState([]);
//   const storage = getStorage();
//   const database = getDatabase();
//   const reference = dbRef(database, 'requests');
//   const navigate = useNavigate();
//   const [teacherRequests, setTeacherRequests] = useState([]);

//   useEffect(() => {
//     const requestsRef = dbRef(getDatabase(), 'teachersRequest');
//     onValue(requestsRef, (snapshot) => {
//       const data = snapshot.val();
//       const requests = data
//         ? Object.keys(data).map((key) => ({
//             id: key,
//             fullName: data[key].fullName || 'Не указано',
//             photoUrl: data[key].photoUrl || defaultAvatar,
//             status: data[key].status || 'pending',
//             email: data[key].email || 'Информация отсутствует',
//           }))
//         : [];
//       setTeacherRequests(requests);
//     });
//   }, []);  

//   useEffect(() => {
//     const requestsRef = dbRef(database, "requests");
//     onValue(requestsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const formattedData = Object.keys(data).map((key) => ({
//           id: key,
//           ...data[key],
//           status: data[key].status || 'pending', // Новый ключ состояния заявки
//         }));
//         setRequests(formattedData);
//         setNewRequestsCount(formattedData.length);
//       }
//     });
//   }, [database]);

//   const handleRequestStatusChange = async (userId, status) => {
//     try {
//       const userRef = dbRef(database, `users/${userId}`);
//       await update(userRef, { identificationStatus: status });
//       toast.success(`Заявка ${status === "verified" ? "принята" : "отклонена"}`);
//     } catch (error) {
//       console.error("Ошибка при обновлении статуса заявки:", error);
//     }
//   };


//   const handleAcceptRequest = (id) => {
//     update(dbRef(database, `requests/${id}`), { status: "accepted" });
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "accepted" } : request
//       )
//     );
//     setNewRequestsCount((prevCount) => prevCount - 1);
//     toast.success('Заявка принята');
//   };

//   const handleRejectRequest = (id) => {
//     update(dbRef(database, `requests/${id}`), { status: "rejected" });
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "rejected" } : request
//   )
//     );
//     setNewRequestsCount((prevCount) => prevCount - 1);
//     toast.error('Заявка отклонена');
//   };

//   const handleEditRequest = (id) => {
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "pending" } : request
//   )
//     );
//     toast.info('Заявка возвращена для редактирования');
//   };

//   useEffect(() => {
//     const teachersRef = dbRef(database, 'teachers');
//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedTeachers = Object.keys(data).map(id => ({ id, ...data[id] }));
//         setTeachers(loadedTeachers);
//         setFilteredTeachers(loadedTeachers);
//       } else {
//         setTeachers([]);
//       }
//     });
//   }, [database]);

//   const compressImage = async (file) => {
//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     try {
//       const compressedFile = await imageCompression(file, options);
//       return compressedFile;
//     } catch (error) {
//       console.log("Ошибка при сжатии изображения:", error);
//       return file;
//     }
//   };

//   const handleSaveTeacher = async () => {
//     if (newTeacher.name && newTeacher.surname && newTeacher.subject && newTeacher.login && newTeacher.password) {
//       setIsLoading(true);
//       let photoURL = '';
//       if (photoFile) {
//         const compressedPhoto = await compressImage(photoFile);
//         const fileRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
//         await uploadBytes(fileRef, compressedPhoto);
//         photoURL = await getDownloadURL(fileRef);
//       }

//       const teacherData = { ...newTeacher, photo: photoURL };

//       if (editingTeacherId) {
//         const updatedTeachers = teachers.map(t =>
//           t.id === editingTeacherId ? { ...t, ...teacherData } : t
//         );
//         setTeachers(updatedTeachers);

//         const teacherRef = dbRef(database, `teachers/${editingTeacherId}`);
//         await update(teacherRef, teacherData);
//         window.location.reload();
//         toast.success('Преподаватель успешно изменен!');
//       } else {
//         const teachersRef = dbRef(database, 'teachers');
//         const newTeacherRef = push(teachersRef);
//         await set(newTeacherRef, teacherData);
//         toast.success('Преподаватель успешно добавлен!');
//       }

//       setIsEditing(false);
//       setNewTeacher({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
//       setPhotoFile(null);
//       setEditingTeacherId(null);
//       setIsLoading(false);
//     }
//   };

//   const handleEditTeacher = (teacher) => {
//     setNewTeacher(teacher);
//     setEditingTeacherId(teacher.id);
//     setIsEditing(true);
//   };

//   const handleDeleteTeacher = async (id) => {
//     setTeachers(teachers.filter(t => t.id !== id));
//     const teacherRef = dbRef(database, `teachers/${id}`);
//     await remove(teacherRef);
//     toast.success('Преподаватель успешно удален!');
//   };

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     const filtered = teachers.filter(teacher =>
//       teacher.name.toLowerCase().includes(query)
//     );
//     setFilteredTeachers(filtered);
//   };

//   const handleSelectTeacher = (teacher) => {
//     setFilteredTeachers([teacher]);
//   };

//   const goToProfile = (userId) => {
//     navigate(`/profile/${userId}`);
//   };

//   return (
//     <div className="admin-panel">
//       <h1>Административная панель</h1>

//       <div className="admin-buttons">
//         <button className='ap-buttons-add-edit' onClick={() => setIsEditing(true)}><FaPlus /> Добавить преподавателя</button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowRequests(!showRequests)}>
//           {showRequests ? 'Скрыть заявки' : 'Показать заявки'}
//           {newRequestsCount > 0 && <div className="new-request-count-basic"><span className="new-requests-count">{newRequestsCount}</span> </div>}
//         </button>
// <button onClick={() => setShowteacherRequests(!showteacherRequests)} className='ap-buttons-add-edit'>
//   {showteacherRequests ? 'Скрыть заявки преподавателей' : 'Показать заявки преподавателей'}
// </button>
//       </div>

//       {isEditing && !isLoading && (
//         <div className="adm-modal">
//           <div className="adm-modal-content">
//             <h2>{editingTeacherId ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h2>
//             <input 
//               type="text" 
//               placeholder="Имя" 
//               value={newTeacher.name} 
//               onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} 
//             />
//             <input 
//               type="text" 
//               placeholder="Фамилия" 
//               value={newTeacher.surname} 
//               onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })} 
//               />
//             <input 
//               type="text" 
//               placeholder="Предмет" 
//               value={newTeacher.subject} 
//               onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} 
//               />
//             <input 
//               type="text" 
//               placeholder="Статус" 
//               value={newTeacher.status} 
//               onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value })} 
//               />
//             <input 
//               type="text" 
//               placeholder="Логин" 
//               value={newTeacher.login} 
//               onChange={(e) => setNewTeacher({ ...newTeacher, login: e.target.value })} 
//               />
//             <input 
//               type="text" 
//               placeholder="Пароль" 
//               value={newTeacher.password} 
//               onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} 
//               />
//             <input 
//               type="file" 
//               accept="image/*" 
//               onChange={(e) => setPhotoFile(e.target.files[0])} 
//               />
//             <div className="adm-modal-buttons">
//             <button onClick={handleSaveTeacher}>{editingTeacherId ? 'Сохранить изменения' : 'Добавить'}</button>
//             <button onClick={() => setIsEditing(false)}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}

//        {showTeachersList && (
//          <div className="teachers-list">
//            <h2>Список преподавателей</h2>

//            <input 
//              className='search-teacherc-input'
//              type="search" 
//              placeholder="Поиск преподавателя..." 
//              value={searchQuery}
//              onChange={handleSearchChange}
//              />
//            {searchQuery && (
//              <div className="search-suggestions">
//                {filteredTeachers.map(teacher => (
//                  <div 
//                    key={teacher.id} 
//                    className="suggestion-item" 
//                    onClick={() => handleSelectTeacher(teacher)}
//                    >
//                    {teacher.name} {teacher.surname}
//                  </div>
//                ))}
//              </div>
//            )}

//            <div className="teachers-grid">
//              {filteredTeachers.map(teacher => (
//                <div key={teacher.id} className="teacher-card">
//                  <div className="card-header">
//                    <img src={teacher.photo || 'default-photo-url.jpg'} alt={`${teacher.name} ${teacher.surname}`} />
//                    <FaEdit className="edit-icon" onClick={() => handleEditTeacher(teacher)} />
//                  </div>
//                  <div className="card-body">
//                    <h3>{`${teacher.name} ${teacher.surname}`}</h3>
//                    <p><strong>Предмет:</strong> {teacher.subject}</p>
//                    <p><strong>Статус:</strong> {teacher.status}</p>
//                    <p><strong>Логин:</strong> {teacher.login}</p>
//                    <div className="card-actions">
//                      <button onClick={() => handleDeleteTeacher(teacher.id)}><FaTrash /> Удалить</button>
//                    </div>
//                  </div>
//                </div>
//              ))}
//            </div>
//          </div>
//        )}

// {showRequests && (
//         <div className="ident-requests">
//           <h2>Заявки на идентификацию от студентов</h2>
//           <div className="ident-requests-cards">
//           {requests.map((request) => (
//             <div
//             key={request.id}
//             className={`request-card ${
//               request.status !== 'pending' ? 'compact-card' : ''
//             }`}
//             >
//               {request.status === 'pending' ? (
//                 <>
//                   <p>ФИО: {request.fio}</p>
//                   <p>Факультет: {request.faculty}</p>
//                   <p>Курс: {request.course}</p>
//                   <p>Группа: {request.group}</p>
//                   {request.photoUrl && <img src={request.photoUrl} alt="Фото студента" className="request-card-photo" />}
//                   <button onClick={() => handleAcceptRequest(request.id)}>Принять</button>
//                   <button onClick={() => handleRejectRequest(request.id)}>Отклонить</button>
//                 </>
//               ) : (
//                 <div className="compact-content">
//                   {request.photoUrl && (
//                     <img src={request.photoUrl} alt="Фото студента" className="compact-photo" />
//                   )}
//                   <div className="compact-info">
//                     <p>{request.fio}</p>
//                     <p
//                       className={`status-label ${
//                         request.status === 'accepted' ? 'accepted' : 'rejected'
//                       }`}
//                       >
//                       {request.status === 'accepted' ? 'Идентифицирован' : 'Не идентифицирован'}
//                     </p>
//                   </div>
//                   <FaEdit
//                     className="edit-icon-request-card"
//                     onClick={() => handleEditRequest(request.id)}
//                     />
//                 </div>
//               )}
//             </div>
//           ))}
//           </div>
//         </div>
//       )}

// {showteacherRequests && (
//   <div className="teacher-requests">
//     <h2>Заявки преподавателей</h2>
//     <div className="requests-list">
//     {teacherRequests.map((request) => (
//   <div key={request.id} className="request-card">
//     <img src={request.photoUrl} alt="Фото преподавателя" />
//     <h3>{request.fullName}</h3>
//     <p>Статус: {request.status}</p>
//     <p>Электронная почта: {request.email}</p>
//   </div>
// ))}
//     </div>
//   </div>
// )}

//       <ToastContainer />
//     </div>
//   );
// };

// export default AdminPanel;


















//упрощенная версия
// import React, { useState, useEffect } from 'react';
// import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getDatabase, ref as dbRef, onValue, set, get, push, update, remove } from "firebase/database";
// import imageCompression from 'browser-image-compression';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import '../AdminPanel.css';
// import '../App.css';
// import defaultAvatar from "../default-image.png";

// const AdminPanel = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [showTeachersList, setShowTeachersList] = useState(false);
//   const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
//   const [photoFile, setPhotoFile] = useState(null);
//   const [editingTeacherId, setEditingTeacherId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [requests, setRequests] = useState([]);
//   const [showRequests, setShowRequests] = useState(false);
//   const [newRequestsCount, setNewRequestsCount] = useState(0);
//   const storage = getStorage();
//   const database = getDatabase();
//   const reference = dbRef(database, 'requests');
//   const [userComments, setUserComments] = useState([]);
//   const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, commentId: null });
//   const [showComments, setShowComments] = useState(false);
//   const [teacherComments, setTeacherComments] = useState([]);
//   const [showTeacherComments, setShowTeacherComments] = useState(false);
//   const [confirmTeacherCommentDelete, setConfirmTeacherCommentDelete] = useState({ isOpen: false, commentId: null, teacherId: null });
//   const [userMap, setUserMap] = useState({}); // Словарь userId -> username
//   const [postCommentsCount, setPostCommentsCount] = useState(0);
// const [teacherCommentsCount, setTeacherCommentsCount] = useState(0);
// const [searchUserCommentQuery, setSearchUserCommentQuery] = useState("");
// const [filteredUserComments, setFilteredUserComments] = useState([]);
// const [searchTeacherCommentQuery, setSearchTeacherCommentQuery] = useState("");
// const [filteredTeacherComments, setFilteredTeacherComments] = useState([]);
// const [showPosts, setShowPosts] = useState(false);
// const [posts, setPosts] = useState([]);
// const [pendingPostsCount, setPendingPostsCount] = useState(0); // Количество ожидающих постов

// useEffect(() => {
//   const db = getDatabase();
//   const postsRef = dbRef(db, "posts");

//   // Подписка на обновления постов
//   onValue(postsRef, (snapshot) => {
//     const data = snapshot.val();
//     if (data) {
//       const postList = Object.keys(data)
//         .map((key) => ({
//           id: key,
//           ...data[key],
//         }))
//         .filter((post) => post.status === "pending"); // Отображать только ожидающие посты
//       setPosts(postList);
//       setPendingPostsCount(postList.length); // Обновление количества
//     }
//   });
// }, []);

// const handleApprove = (postId) => {
//   const db = getDatabase();
//   const postRef = dbRef(db, `posts/${postId}`);
//   update(postRef, { status: "approved" }); // Меняем статус на "approved"
// };

// const handleReject = (postId) => {
//   const db = getDatabase();
//   const postRef = dbRef(db, `posts/${postId}`);
//   remove(postRef); // Удаляем пост
// };

// useEffect(() => {
//   const filtered = userComments.filter(
//     (comment) =>
//       comment.username.toLowerCase().includes(searchUserCommentQuery.toLowerCase()) ||
//       comment.comment.toLowerCase().includes(searchUserCommentQuery.toLowerCase())
//   );
//   setFilteredUserComments(filtered);
// }, [searchUserCommentQuery, userComments]);

// useEffect(() => {
//   const filtered = teacherComments.filter(
//     (comment) =>
//       comment.username.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase()) ||
//       comment.comment.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase())
//   );
//   setFilteredTeacherComments(filtered);
// }, [searchTeacherCommentQuery, teacherComments]);


//   useEffect(() => {
//     const db = getDatabase();
//     const commentsRef = dbRef(db, "comments");

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         const allComments = [];

//         Object.keys(commentsData).forEach((teacherId) => {
//           const comments = commentsData[teacherId];
//           Object.keys(comments).forEach((commentId) => {
//             allComments.push({
//               id: commentId,
//               teacherId,
//               ...comments[commentId],
//             });
//           });
//         });

//         // Сортировка по дате
//         allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//         // Получение данных о пользователях для анонимных комментариев
//         const userIdsToFetch = [
//           ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
//         ];

//         const userPromises = userIdsToFetch.map(async (userId) => {
//           const userSnapshot = await get(dbRef(db, `users/${userId}`));
//           return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
//         });

//         const users = await Promise.all(userPromises);
//         const userMap = users.reduce((acc, { userId, username }) => {
//           acc[userId] = username;
//           return acc;
//         }, {});

//         setUserMap(userMap);
//         setTeacherComments(allComments);
//       }
//     });

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         let count = 0;

//         Object.keys(commentsData).forEach((teacherId) => {
//           count += Object.keys(commentsData[teacherId]).length;
//         });

//         setTeacherCommentsCount(count);
//       } else {
//         setTeacherCommentsCount(0);
//       }
//     });
//   }, []);

//   const handleDeleteTeacherComment = (commentId, teacherId) => {
//     const db = getDatabase();
//     const commentRef = dbRef(db, `comments/${teacherId}/${commentId}`);

//     remove(commentRef)
//       .then(() => {
//         setTeacherComments((prev) => prev.filter((comment) => comment.id !== commentId));
//         toast.success('Комментарий удалён.');
//       })
//       .catch((error) => {
//         console.error("Ошибка при удалении комментария:", error);
//         toast.error('Ошибка при удалении комментария.');
//       });
//   };

//   const openTeacherCommentDeleteModal = (commentId, teacherId) => {
//     setConfirmTeacherCommentDelete({ isOpen: true, commentId, teacherId });
//   };

//   const confirmTeacherCommentDeleteAction = () => {
//     const { commentId, teacherId } = confirmTeacherCommentDelete;
//     if (commentId && teacherId) {
//       handleDeleteTeacherComment(commentId, teacherId);
//       setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
//     }
//   };

//   const cancelTeacherCommentDelete = () => {
//     setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
//   };  

//   useEffect(() => {
//     const db = getDatabase();
//     const commentsRef = dbRef(db, "postComments");

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         const allComments = [];

//         Object.keys(commentsData).forEach((postId) => {
//           const postComments = commentsData[postId];
//           Object.keys(postComments).forEach((commentId) => {
//             allComments.push({
//               id: commentId,
//               postId,
//               ...postComments[commentId],
//             });
//           });
//         });

//         // Сортировка по дате
//         allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//         // Получение данных о пользователях для анонимных комментариев
//         const userIdsToFetch = [
//           ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
//         ];

//         const userPromises = userIdsToFetch.map(async (userId) => {
//           const userSnapshot = await get(dbRef(db, `users/${userId}`));
//           return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
//         });

//         const users = await Promise.all(userPromises);
//         const userMap = users.reduce((acc, { userId, username }) => {
//           acc[userId] = username;
//           return acc;
//         }, {});

//         setUserMap(userMap);
//         setUserComments(allComments);
//       }
//     });

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         let count = 0;

//         Object.keys(commentsData).forEach((postId) => {
//           count += Object.keys(commentsData[postId]).length;
//         });

//         setPostCommentsCount(count);
//       } else {
//         setPostCommentsCount(0);
//       }
//     });
//   }, []);

//   const confirmDeleteComment = () => {
//     const db = getDatabase();
//     const { commentId } = confirmDelete;

//     if (commentId) {
//         const comment = userComments.find((c) => c.id === commentId);

//         if (comment) {
//             const commentRef = dbRef(db, `postComments/${comment.postId}/${comment.id}`);
//             const postRef = dbRef(db, `posts/${comment.postId}`);

//             remove(commentRef)
//                 .then(() => {
//                     // Пересчет количества комментариев
//                     onValue(dbRef(db, `postComments/${comment.postId}`), (snapshot) => {
//                         const commentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
//                         update(postRef, { commentCount })
//                             .then(() => {
//                                 setUserComments((prevComments) =>
//                                     prevComments.filter((c) => c.id !== commentId)
//                                 );
//                                 setConfirmDelete({ isOpen: false, commentId: null });
//                             })
//                             .catch((error) => {
//                                 console.error("Ошибка при обновлении количества комментариев:", error);
//                             });
//                     }, { onlyOnce: true });
//                 })
//                 .catch((error) => {
//                     console.error("Ошибка при удалении комментария:", error);
//                 });
//         }
//     }
// };

//   const handleDeleteClick = (commentId) => {
//     setConfirmDelete({ isOpen: true, commentId });
//   };

//   const cancelDelete = () => {
//     setConfirmDelete({ isOpen: false, commentId: null });
//   };

//   const toggleShowComments = () => {
//     setShowComments((prev) => !prev);
//   };

//   useEffect(() => {
//     const teachersRef = dbRef(database, 'teachers');
//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedTeachers = Object.keys(data).map(id => ({ id, ...data[id] }));
//         setTeachers(loadedTeachers);
//         setFilteredTeachers(loadedTeachers);
//       } else {
//         setTeachers([]);
//       }
//     });
//   }, [database]);

//   useEffect(() => {
//     const requestsRef = dbRef(database, "requests");
//     onValue(requestsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const formattedData = Object.keys(data).map((key) => ({
//           id: key,
//           ...data[key],
//           status: data[key].status || 'pending', // Новый ключ состояния заявки
//         }));
//         setRequests(formattedData);
//         setNewRequestsCount(formattedData.length);
//       }
//     });
//   }, [database]);

//   const handleRequestStatusChange = async (userId, status) => {
//     try {
//       const userRef = dbRef(database, `users/${userId}`);
//       await update(userRef, { identificationStatus: status });
//       toast.success(`Заявка ${status === "verified" ? "принята" : "отклонена"}`);
//     } catch (error) {
//       console.error("Ошибка при обновлении статуса заявки:", error);
//     }
//   };

//   const handleAcceptRequest = (id) => {
//     update(dbRef(database, `requests/${id}`), { status: "accepted" });
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "accepted" } : request
//       )
//     );
//     setNewRequestsCount((prevCount) => prevCount - 1);
//     toast.success('Заявка принята');
//   };

//   const handleRejectRequest = (id) => {
//     update(dbRef(database, `requests/${id}`), { status: "rejected" });
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "rejected" } : request
//   )
//     );
//     setNewRequestsCount((prevCount) => prevCount - 1);
//     toast.error('Заявка отклонена');
//   };

//   const handleEditRequest = (id) => {
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "pending" } : request
//   )
//     );
//     toast.info('Заявка возвращена для редактирования');
//   };

//   const compressImage = async (file) => {
//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     try {
//       const compressedFile = await imageCompression(file, options);
//       return compressedFile;
//     } catch (error) {
//       console.log("Ошибка при сжатии изображения:", error);
//       return file;
//     }
//   };

//   const handleSaveTeacher = async () => {
//     if (newTeacher.name && newTeacher.surname && newTeacher.subject && newTeacher.login && newTeacher.password) {
//       setIsLoading(true);
//       let photoURL = '';
//       if (photoFile) {
//         const compressedPhoto = await compressImage(photoFile);
//         const fileRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
//         await uploadBytes(fileRef, compressedPhoto);
//         photoURL = await getDownloadURL(fileRef);
//       }

//       const teacherData = { ...newTeacher, photo: photoURL };

//       if (editingTeacherId) {
//         const updatedTeachers = teachers.map(t =>
//           t.id === editingTeacherId ? { ...t, ...teacherData } : t
//         );
//         setTeachers(updatedTeachers);

//         const teacherRef = dbRef(database, `teachers/${editingTeacherId}`);
//         await update(teacherRef, teacherData);
//         window.location.reload();
//         toast.success('Преподаватель успешно изменен!');
//       } else {
//         const teachersRef = dbRef(database, 'teachers');
//         const newTeacherRef = push(teachersRef);
//         await set(newTeacherRef, teacherData);
//         toast.success('Преподаватель успешно добавлен!');
//       }

//       setIsEditing(false);
//       setNewTeacher({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
//       setPhotoFile(null);
//       setEditingTeacherId(null);
//       setIsLoading(false);
//     }
//   };

//   const handleEditTeacher = (teacher) => {
//     setNewTeacher(teacher);
//     setEditingTeacherId(teacher.id);
//     setIsEditing(true);
//   };

//   const handleDeleteTeacher = async (id) => {
//     setTeachers(teachers.filter(t => t.id !== id));
//     const teacherRef = dbRef(database, `teachers/${id}`);
//     await remove(teacherRef);
//     toast.success('Преподаватель успешно удален!');
//   };

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     const filtered = teachers.filter(teacher =>
//       teacher.name.toLowerCase().includes(query)
//     );
//     setFilteredTeachers(filtered);
//   };

//   const handleSelectTeacher = (teacher) => {
//     setFilteredTeachers([teacher]);
//   };

//   return (
//     <div className="admin-panel">
//       <h1>Административная панель</h1>

//       <div className="admin-buttons">
//         <button className='ap-buttons-add-edit' onClick={() => setIsEditing(true)}><FaPlus /> Добавить преподавателя</button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowRequests(!showRequests)}>
//           {showRequests ? 'Скрыть заявки' : 'Показать заявки'}
//           {newRequestsCount > 0 && <div className="new-request-count-basic"><span className="new-requests-count">{newRequestsCount}</span> </div>}
//         </button>
//       </div>

//       {isLoading && <div className="loading-bar">Подождите немного...</div>}

//       <h2 style={{marginTop: "50px"}}>Комментарии пользователей</h2>
//       <div className="admin-buttons-comments">
//       <button className="toggle-comments-btn" onClick={toggleShowComments}>
//         {showComments ? "Скрыть комментарии постов" : "Показать комментарии постов"}
//         {postCommentsCount > 0 && (
//     <span className="comments-count">{postCommentsCount}</span>
//   )}
//       </button>

//       {showComments && (
//         <div className="user-comments-block">
//     <input
//       type="search"
//       placeholder="Поиск комментариев..."
//       className="search-comments"
//       onChange={(e) => setSearchUserCommentQuery(e.target.value)}
//     />
//   <div id="users-comments">
//     {filteredUserComments.map((comment) => (
//       <div className="adm-user-comment" key={comment.id}>
//         <img
//           src={comment.avatarUrl || defaultAvatar}
//           alt={comment.username}
//           className="adm-comment-avatar"
//         />
//         <div className="adm-comment-details">
//           <p className="adm-comment-username">
//           {comment.username}
//               {comment.username === "Анонимно" && comment.anonymousOwnerId && (
//                 <span> (Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
//               )}
//           </p>
//           <p className="adm-comment-text">{comment.comment}</p>
//           <span className="adm-comment-timestamp">{comment.timestamp}</span>
//         </div>
//         <button
//           className="delete-comment-btn"
//           onClick={() => handleDeleteClick(comment.id)}
//         >
//           🗑️
//         </button>
//       </div>
//     ))}
//   </div>
//   </div>
// )}

// <button className="toggle-comments-btn" onClick={() => setShowTeacherComments(!showTeacherComments)}>
//   {showTeacherComments ? "Скрыть отзывы учителей" : "Показать отзывы учителей"}
//   {teacherCommentsCount > 0 && (
//     <span className="comments-count">{teacherCommentsCount}</span>
//   )}
// </button>

// {showTeacherComments && (
//   <div className="users-tch-comments-block">
//     <input
//       type="search"
//       placeholder="Поиск отзывов об учителях..."
//       className="search-teacher-comments"
//       onChange={(e) => setSearchTeacherCommentQuery(e.target.value)}
//     />
//   <div id="users-tch-comments">
//     {filteredTeacherComments.map((comment) => (
//       <div className="adm-user-comment" key={comment.id}>
//         <img
//           src={comment.avatarUrl || defaultAvatar}
//           alt={comment.username}
//           className="adm-comment-avatar"
//         />
//         <div className="adm-comment-details">
//           <p className="adm-comment-username">
//           {comment.username}
//               {comment.username === "Анонимно" && comment.anonymousOwnerId && (
//                 <span>(Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
//               )}
//           </p>
//           <p className="adm-comment-text">{comment.comment}</p>
//           <span className="adm-comment-timestamp">{comment.timestamp}</span>
//         </div>
//         <button
//           className="delete-comment-btn"
//           onClick={() => openTeacherCommentDeleteModal(comment.id, comment.teacherId)}
//         >
//           🗑️
//         </button>
//       </div>
//     ))}
//   </div>
//   </div>
// )}


// <h2>Заявки Публикаций</h2>
// <button className="ap-buttons-add-edit" onClick={() => setShowPosts(!showPosts)}>
//   {showPosts ? 'Скрыть посты' : 'Показать посты'}
//   {pendingPostsCount > 0 && <span className="comments-count"> {pendingPostsCount}</span>}
// </button>

// {showPosts && (
//   <div id="user-posts">
//     {posts.length > 0 ? (
//       posts.map((post) => (
//         <div key={post.id} className="adm-post-item">
//           <div className="adm-post-header">
//             <img
//               src={post.userAvatar}
//               alt={`${post.userName}'s avatar`}
//               className="adm-user-avatar"
//               style={{ width: "50px", borderRadius: "50%" }}
//             />
//             <div className="adm-user-info">
//               <span className="adm-user-name">{post.userName}</span>
//               <span className="adm-post-date">{new Date(post.createdAt).toLocaleString()}</span>
//             </div>
//           </div>
//           <div className="adm-post-content">
//             {post.mediaUrl && (
//               <img
//                 src={post.mediaUrl}
//                 alt="Post media"
//                 className="adm-post-media"
//                 style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
//               />
//             )}
//             <p className="adm-post-description">{post.description}</p>
//           </div>
//           <div className="adm-post-actions">
//             <button className="approve-btn" onClick={() => handleApprove(post.id)}>Одобрить</button>
//             <button className="reject-btn" onClick={() => handleReject(post.id)}>Отклонить</button>
//           </div>
//         </div>
//       ))
//     ) : (
//       <p style={{color: "yellow"}}>Нет ожидающих постов</p>
//     )}
//   </div>
// )}

// {confirmTeacherCommentDelete.isOpen && (
//   <div className="delete-confirm-overlay">
//     <div className="delete-confirm-modal">
//       <p>Вы уверены, что хотите удалить отзыв об учителе?</p>
//       <div className="confirm-buttons">
//         <button onClick={confirmTeacherCommentDeleteAction}>Да</button>
//         <button onClick={cancelTeacherCommentDelete}>Нет</button>
//       </div>
//     </div>
//   </div>
// )}

//       {confirmDelete.isOpen && (
//         <div className="delete-confirm-overlay">
//           <div className="delete-confirm-modal">
//             <p>Вы уверены, что хотите удалить комментарий пользователя?</p>
//             <div className="confirm-buttons">
//               <button onClick={confirmDeleteComment}>Да</button>
//               <button onClick={cancelDelete}>Нет</button>
//             </div>
//           </div>
//         </div>
//       )}
// </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default AdminPanel;
















//original
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from "react-router-dom";
// import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getDatabase, ref as dbRef, onValue, set, get, push, update, remove } from "firebase/database";
// import imageCompression from 'browser-image-compression';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import '../AdminPanel.css';
// import '../App.css';
// import defaultAvatar from "../default-image.png";
// import defaultTeacherImg from "../teacher.svg";
// import useTranslation from '../hooks/useTranslation';

// const initialScheduleData = {
//   monday: [],
//   tuesday: [],
//   wednesday: [],
//   thursday: [],
//   friday: [],
//   saturday: [],
//   sunday: [],
// };

// const AdminPanel = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [showTeachersList, setShowTeachersList] = useState(false);
//   const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
//   const [photoFile, setPhotoFile] = useState(null);
//   const [editingTeacherId, setEditingTeacherId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [requests, setRequests] = useState([]);
//   const [showRequests, setShowRequests] = useState(false);
//   const [newRequestsCount, setNewRequestsCount] = useState(0);
//   const storage = getStorage();
//   const database = getDatabase();
//   const reference = dbRef(database, 'requests');
//   const [userComments, setUserComments] = useState([]);
//   const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, commentId: null });
//   const [showComments, setShowComments] = useState(false);
//   const [teacherComments, setTeacherComments] = useState([]);
//   const [showTeacherComments, setShowTeacherComments] = useState(false);
//   const [confirmTeacherCommentDelete, setConfirmTeacherCommentDelete] = useState({ isOpen: false, commentId: null, teacherId: null });
//   const [userMap, setUserMap] = useState({}); // Словарь userId -> username
//   const [postCommentsCount, setPostCommentsCount] = useState(0);
//   const [teacherCommentsCount, setTeacherCommentsCount] = useState(0);
//   const [searchUserCommentQuery, setSearchUserCommentQuery] = useState("");
//   const [filteredUserComments, setFilteredUserComments] = useState([]);
//   const [searchTeacherCommentQuery, setSearchTeacherCommentQuery] = useState("");
//   const [filteredTeacherComments, setFilteredTeacherComments] = useState([]);
//   const [showPosts, setShowPosts] = useState(false);
//   const [posts, setPosts] = useState([]);
//   const [pendingPostsCount, setPendingPostsCount] = useState(0); // Количество ожидающих постов  
//   const navigate = useNavigate();
//   const [showScheduleEditor, setShowScheduleEditor] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState("");
//   const [scheduleData, setScheduleData] = useState(initialScheduleData);
//   const [isScheduleLoading, setIsScheduleLoading] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState(""); // Новое состояние для курса
//   const t = useTranslation();
//   const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
//   const [pwaInstallCount, setPwaInstallCount] = useState(0);
//   const [showUsersList, setShowUsersList] = useState(false);
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     const installsRef = dbRef(database, 'pwaInstalls');
//     onValue(installsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setPwaInstallCount(snapshot.val());
//       } else {
//         setPwaInstallCount(0);
//       }
//     });
//   }, []);

//   const fetchUsers = () => {
//     const usersRef = dbRef(database, 'users');
//     onValue(usersRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         const usersArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
//         setUsers(usersArray);
//       } else {
//         setUsers([]);
//       }
//     });
//   };

//   const toggleUsersList = () => {
//     setShowUsersList((prev) => {
//       const newState = !prev;
//       if (newState) fetchUsers();
//       return newState;
//     });
//   };

//   const handleCourseSelect = (e) => {
//     const course = e.target.value;
//     setSelectedCourse(course);
//   };

//   // Функция загрузки расписания для выбранной группы
//   const loadScheduleForGroup = (group) => {
//     setIsScheduleLoading(true);
//     const scheduleRef = dbRef(database, `schedules/${group}`);
//     onValue(scheduleRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setScheduleData(data);
//       } else {
//         // Если расписание ещё не создано – задаём начальные данные
//         setScheduleData(initialScheduleData);
//       }
//       setIsScheduleLoading(false);
//     }, { onlyOnce: true });
//   };

//   // Сохранение расписания в Firebase
//   const handleSaveSchedule = () => {
//     if (!selectedGroup || !selectedCourse) {
//       toast.error("Пожалуйста, выберите и группу, и курс");
//       return;
//     }
//     const scheduleRef = dbRef(database, `schedules/${selectedCourse}/${selectedGroup}`);
//     set(scheduleRef, scheduleData)
//       .then(() => {
//         toast.success("Расписание успешно сохранено");
//         setShowScheduleEditor(false);
//       })
//       .catch((error) => {
//         console.error("Ошибка при сохранении расписания:", error);
//         toast.error("Ошибка при сохранении расписания");
//       });
//   };

//   // Обновляем функцию добавления урока, чтобы добавить поле teacher
//   const addLesson = (day) => {
//     setScheduleData(prev => ({
//       ...prev,
//       [day]: [...prev[day], { order: '', subject: '', startTime: '', endTime: '', teacher: '' }]
//     }));
//   };

//   // Функция для обновления любого поля урока уже универсальна (работает и с teacher)
//   const updateLesson = (day, index, field, value) => {
//     setScheduleData(prev => {
//       const newDayLessons = [...prev[day]];
//       newDayLessons[index] = { ...newDayLessons[index], [field]: value };
//       return { ...prev, [day]: newDayLessons };
//     });
//   };

//   // Функция для удаления урока из дня
//   const removeLesson = (day, index) => {
//     setScheduleData(prev => {
//       const newDayLessons = [...prev[day]];
//       newDayLessons.splice(index, 1);
//       return { ...prev, [day]: newDayLessons };
//     });
//   };

//   // Обработчик выбора группы в селекторе
//   const handleGroupSelect = (e) => {
//     const group = e.target.value;
//     setSelectedGroup(group);
//     if (group) {
//       loadScheduleForGroup(group);
//     }
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const postsRef = dbRef(db, "posts");

//     // Подписка на обновления постов
//     onValue(postsRef, async (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const postList = await Promise.all(
//           Object.keys(data)
//             .map(async (key) => {
//               const post = data[key];
//               if (post.status !== "pending") return null;

//               let userName = post.userName;
//               let userAvatar = post.userAvatar;

//               if (post.userId) {
//                 try {
//                   const userSnapshot = await get(dbRef(database, `users/${post.userId}`));
//                   const userData = userSnapshot.val();
//                   if (userData) {
//                     userName = userData.username || userName;
//                     userAvatar = userData.avatarUrl || userAvatar;
//                   }
//                 } catch (err) {
//                   console.error("Ошибка загрузки пользователя:", err);
//                 }
//               }

//               return {
//                 id: key,
//                 ...post,
//                 userName,
//                 userAvatar,
//               };
//             })
//         );

//         setPosts(postList.filter(Boolean));
//         setPendingPostsCount(postList.filter(Boolean).length);
//       }
//     });
//   }, []);

//   const handleApprove = (postId) => {
//     const db = getDatabase();
//     const postRef = dbRef(db, `posts/${postId}`);
//     update(postRef, { status: "approved" }); // Меняем статус на "approved"
//     toast.success('Публикация успешно одобрена!');
//   };

//   const handleReject = (postId) => {
//     const db = getDatabase();
//     const postRef = dbRef(db, `posts/${postId}`);
//     remove(postRef); // Удаляем пост
//     toast.success('Публикация успешно отклонена!');
//   };

//   useEffect(() => {
//     const filtered = userComments.filter(
//       (comment) =>
//         comment.username.toLowerCase().includes(searchUserCommentQuery.toLowerCase()) ||
//         comment.comment.toLowerCase().includes(searchUserCommentQuery.toLowerCase())
//     );
//     setFilteredUserComments(filtered);
//   }, [searchUserCommentQuery, userComments]);

//   useEffect(() => {
//     const filtered = teacherComments.filter(
//       (comment) =>
//         comment.username.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase()) ||
//         comment.comment.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase())
//     );
//     setFilteredTeacherComments(filtered);
//   }, [searchTeacherCommentQuery, teacherComments]);


//   useEffect(() => {
//     const db = getDatabase();
//     const commentsRef = dbRef(db, "comments");

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         const allComments = [];

//         Object.keys(commentsData).forEach((teacherId) => {
//           const comments = commentsData[teacherId];
//           Object.keys(comments).forEach((commentId) => {
//             allComments.push({
//               id: commentId,
//               teacherId,
//               ...comments[commentId],
//             });
//           });
//         });

//         // Сортировка по дате
//         allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//         // Получение данных о пользователях для анонимных комментариев
//         const userIdsToFetch = [
//           ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
//         ];

//         const userPromises = userIdsToFetch.map(async (userId) => {
//           const userSnapshot = await get(dbRef(db, `users/${userId}`));
//           return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
//         });

//         const users = await Promise.all(userPromises);
//         const userMap = users.reduce((acc, { userId, username }) => {
//           acc[userId] = username;
//           return acc;
//         }, {});

//         setUserMap(userMap);
//         setTeacherComments(allComments);
//       }
//     });

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         let count = 0;

//         Object.keys(commentsData).forEach((teacherId) => {
//           count += Object.keys(commentsData[teacherId]).length;
//         });

//         setTeacherCommentsCount(count);
//       } else {
//         setTeacherCommentsCount(0);
//       }
//     });
//   }, []);

//   const handleDeleteTeacherComment = (commentId, teacherId) => {
//     const db = getDatabase();
//     const commentRef = dbRef(db, `comments/${teacherId}/${commentId}`);

//     remove(commentRef)
//       .then(() => {
//         setTeacherComments((prev) => prev.filter((comment) => comment.id !== commentId));
//         toast.success('Комментарий удалён.');
//       })
//       .catch((error) => {
//         console.error("Ошибка при удалении комментария:", error);
//         toast.error('Ошибка при удалении комментария.');
//       });
//   };

//   const openTeacherCommentDeleteModal = (commentId, teacherId) => {
//     setConfirmTeacherCommentDelete({ isOpen: true, commentId, teacherId });
//   };

//   const confirmTeacherCommentDeleteAction = () => {
//     const { commentId, teacherId } = confirmTeacherCommentDelete;
//     if (commentId && teacherId) {
//       handleDeleteTeacherComment(commentId, teacherId);
//       setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
//     }
//   };

//   const cancelTeacherCommentDelete = () => {
//     setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const commentsRef = dbRef(db, "postComments");

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         const allComments = [];

//         Object.keys(commentsData).forEach((postId) => {
//           const postComments = commentsData[postId];
//           Object.keys(postComments).forEach((commentId) => {
//             allComments.push({
//               id: commentId,
//               postId,
//               ...postComments[commentId],
//             });
//           });
//         });

//         // Сортировка по дате
//         allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//         // Получение данных о пользователях для анонимных комментариев
//         const userIdsToFetch = [
//           ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
//         ];

//         const userPromises = userIdsToFetch.map(async (userId) => {
//           const userSnapshot = await get(dbRef(db, `users/${userId}`));
//           return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
//         });

//         const users = await Promise.all(userPromises);
//         const userMap = users.reduce((acc, { userId, username }) => {
//           acc[userId] = username;
//           return acc;
//         }, {});

//         setUserMap(userMap);
//         setUserComments(allComments);
//       }
//     });

//     onValue(commentsRef, async (snapshot) => {
//       const commentsData = snapshot.val();
//       if (commentsData) {
//         let count = 0;

//         Object.keys(commentsData).forEach((postId) => {
//           count += Object.keys(commentsData[postId]).length;
//         });

//         setPostCommentsCount(count);
//       } else {
//         setPostCommentsCount(0);
//       }
//     });
//   }, []);

//   const confirmDeleteComment = () => {
//     const db = getDatabase();
//     const { commentId } = confirmDelete;

//     if (commentId) {
//       const comment = userComments.find((c) => c.id === commentId);

//       if (comment) {
//         const commentRef = dbRef(db, `postComments/${comment.postId}/${comment.id}`);
//         const postRef = dbRef(db, `posts/${comment.postId}`);

//         remove(commentRef)
//           .then(() => {
//             // Пересчет количества комментариев
//             onValue(dbRef(db, `postComments/${comment.postId}`), (snapshot) => {
//               const commentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
//               update(postRef, { commentCount })
//                 .then(() => {
//                   setUserComments((prevComments) =>
//                     prevComments.filter((c) => c.id !== commentId)
//                   );
//                   setConfirmDelete({ isOpen: false, commentId: null });
//                 })
//                 .catch((error) => {
//                   console.error("Ошибка при обновлении количества комментариев:", error);
//                 });
//             }, { onlyOnce: true });
//           })
//           .catch((error) => {
//             console.error("Ошибка при удалении комментария:", error);
//           });
//       }
//     }
//   };

//   const handleDeleteClick = (commentId) => {
//     setConfirmDelete({ isOpen: true, commentId });
//   };

//   const cancelDelete = () => {
//     setConfirmDelete({ isOpen: false, commentId: null });
//   };

//   const toggleShowComments = () => {
//     setShowComments((prev) => !prev);
//   };

//   useEffect(() => {
//     const teachersRef = dbRef(database, 'teachers');
//     onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loadedTeachers = Object.keys(data).map(id => ({ id, ...data[id] }));
//         setTeachers(loadedTeachers);
//         setFilteredTeachers(loadedTeachers);
//       } else {
//         setTeachers([]);
//       }
//     });
//   }, [database]);

//   useEffect(() => {
//     const requestsRef = dbRef(database, "requests");
//     onValue(requestsRef, async (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const formattedData = await Promise.all(
//           Object.keys(data).map(async (key) => {
//             // Берем данные заявки
//             const request = { id: key, ...data[key], status: data[key].status || 'pending' };
//             // Если заявка в статусе "pending", проверяем роль отправителя
//             if (request.status === 'pending') {
//               const userSnapshot = await get(dbRef(database, `users/${request.senderId}`));
//               const userData = userSnapshot.val();
//               if (userData && userData.role === 'dean') {
//                 // Если отправитель — декан, обновляем статус заявки автоматически
//                 await update(dbRef(database, `requests/${key}`), { status: "accepted" });
//                 request.status = "accepted";
//               }
//             }
//             return request;
//           })
//         );
//         setRequests(formattedData);
//         setNewRequestsCount(formattedData.filter(req => req.status === 'pending').length);
//       }
//     });
//   }, [database]);

//   const handleRequestStatusChange = async (userId, status) => {
//     try {
//       const userRef = dbRef(database, `users/${userId}`);
//       await update(userRef, { identificationStatus: status });
//       toast.success(`Заявка ${status === "verified" ? "принята" : "отклонена"}`);
//     } catch (error) {
//       console.error("Ошибка при обновлении статуса заявки:", error);
//     }
//   };

//   const handleAcceptRequest = (id) => {
//     update(dbRef(database, `requests/${id}`), { status: "accepted" })
//       .then(() => {
//         const acceptedRequest = requests.find(req => req.id === id);

//         // Обновляем статус идентификации пользователя
//         const userRef = dbRef(database, `users/${acceptedRequest.userId}`);
//         update(userRef, { identificationStatus: 'accepted' });

//         if (acceptedRequest && acceptedRequest.group && acceptedRequest.course) {
//           const groupKey = acceptedRequest.group;
//           const courseKey = acceptedRequest.course;
//           const groupRef = push(dbRef(database, `groups/${courseKey}/${groupKey}`));
//           set(groupRef, {
//             ...acceptedRequest,
//             userAvatar: acceptedRequest.userAvatar || acceptedRequest.photoUrl || defaultAvatar
//           });
//         }

//         setRequests(prevRequests =>
//           prevRequests.map(request =>
//             request.id === id ? { ...request, status: "accepted" } : request
//           )
//         );
//         setNewRequestsCount(prevCount => prevCount - 1);
//         toast.success('Заявка принята');
//       })
//       .catch(error => {
//         console.error("Ошибка при принятии заявки:", error);
//         toast.error('Ошибка при принятии заявки');
//       });
//   };

//   const handleRejectRequest = (id) => {
//     update(dbRef(database, `requests/${id}`), { status: "rejected" });
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "rejected" } : request
//       )
//     );
//     setNewRequestsCount((prevCount) => prevCount - 1);
//     toast.error('Заявка отклонена');
//   };

//   const handleEditRequest = (id) => {
//     setRequests((prevRequests) =>
//       prevRequests.map((request) =>
//         request.id === id ? { ...request, status: "pending" } : request
//       )
//     );
//     toast.info('Заявка возвращена для редактирования');
//   };

//   // 1) Добавьте в начало компонента новые состояния и функции:

//   const [confirmDeleteReq, setConfirmDeleteReq] = useState({
//     isOpen: false,
//     id: null,
//     username: '',
//   });

//   // Открыть модалку удаления
//   const openDeleteReqModal = (id, username) => {
//     setConfirmDeleteReq({ isOpen: true, id, username });
//   };

//   // Подтвердить удаление
//   const confirmDeleteReqAction = () => {
//     const { id } = confirmDeleteReq;
//     if (!id) return;
//     // Удаляем заявку из базы
//     remove(dbRef(database, `requests/${id}`))
//       .then(() => {
//         // Убираем из локального состояния
//         setRequests(prev => prev.filter(r => r.id !== id));
//         toast.success('Заявка успешно удалена');
//       })
//       .catch(err => {
//         console.error(err);
//         toast.error('Ошибка при удалении заявки');
//       })
//       .finally(() => {
//         setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
//       });
//   };

//   // Отменить удаление
//   const cancelDeleteReq = () => {
//     setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
//   };

//   // state для модалки отклонения
//   const [rejectModal, setRejectModal] = useState({
//     isOpen: false,
//     id: null,
//     senderId: null,
//     username: '',
//     reason: ''
//   });

//   // открыть модалку
//   const openRejectModal = (id, senderId, username) => {
//     setRejectModal({ isOpen: true, id, senderId, username, reason: '' });
//   };

//   // отмена отклонения
//   const cancelReject = () => {
//     setRejectModal({ isOpen: false, id: null, senderId: null, username: '', reason: '' });
//   };

//   // отправка причины отклонения
//   const confirmRejectSend = async () => {
//     const { id, senderId, reason } = rejectModal;
//     if (!reason.trim()) return;

//     // 0) Обновляем статус пользователя
//     await update(dbRef(database, `users/${senderId}`), { 
//       identificationStatus: 'rejected' 
//     });

//     // 1) обновляем статус заявки
//     await update(dbRef(database, `requests/${id}`), { status: 'rejected' });

//     // 2) опционально обновим статус в профиле пользователя
//     await update(dbRef(database, `users/${senderId}`), { identificationStatus: 'rejected' });

//     // 3) формируем и пушим уведомление
//     const notification = {
//       type: 'identification_rejected',
//       message: reason,
//       timestamp: new Date().toISOString(),
//     };
//     await push(dbRef(database, `notifications/${senderId}`), notification);

//     // 4) обновляем локальный стейт списка заявок
//     setRequests(prev => prev.map(r =>
//       r.id === id ? { ...r, status: 'rejected' } : r
//     ));

//     // 5) закрываем модалку
//     cancelReject();
//     toast.success('Заявка откланена! Пользователю отправлено уведомление о причины!');
//   };

//   const compressImage = async (file) => {
//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     try {
//       const compressedFile = await imageCompression(file, options);
//       return compressedFile;
//     } catch (error) {
//       console.log("Ошибка при сжатии изображения:", error);
//       return file;
//     }
//   };

//   const handleSaveTeacher = async () => {
//     if (newTeacher.name && newTeacher.surname && newTeacher.subject && newTeacher.login && newTeacher.password) {
//       setIsLoading(true);
//       let photoURL = '';
//       if (photoFile) {
//         const compressedPhoto = await compressImage(photoFile);
//         const fileRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
//         await uploadBytes(fileRef, compressedPhoto);
//         photoURL = await getDownloadURL(fileRef);
//       }

//       const teacherData = { ...newTeacher, photo: photoURL };

//       if (editingTeacherId) {
//         const updatedTeachers = teachers.map(t =>
//           t.id === editingTeacherId ? { ...t, ...teacherData } : t
//         );
//         setTeachers(updatedTeachers);

//         const teacherRef = dbRef(database, `teachers/${editingTeacherId}`);
//         await update(teacherRef, teacherData);
//         window.location.reload();
//         toast.success('Преподаватель успешно изменен!');
//       } else {
//         const teachersRef = dbRef(database, 'teachers');
//         const newTeacherRef = push(teachersRef);
//         await set(newTeacherRef, teacherData);
//         toast.success('Преподаватель успешно добавлен!');
//       }

//       setIsEditing(false);
//       setNewTeacher({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
//       setPhotoFile(null);
//       setEditingTeacherId(null);
//       setIsLoading(false);
//     }
//   };

//   const handleEditTeacher = (teacher) => {
//     setNewTeacher(teacher);
//     setEditingTeacherId(teacher.id);
//     setIsEditing(true);
//   };

//   const handleDeleteTeacher = async (id) => {
//     setTeachers(teachers.filter(t => t.id !== id));
//     const teacherRef = dbRef(database, `teachers/${id}`);
//     await remove(teacherRef);
//     toast.success('Преподаватель успешно удален!');
//   };

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     const filtered = teachers.filter(teacher =>
//       teacher.name.toLowerCase().includes(query)
//     );
//     setFilteredTeachers(filtered);
//   };

//   const handleSelectTeacher = (teacher) => {
//     setFilteredTeachers([teacher]);
//   };

//   const goToProfile = (userId) => {
//     navigate(`/profile/${userId}`);
//   };

//   return (
//     <div className="admin-panel">
//       <h1>Административная панель</h1>

//       <div className="admin-buttons">
//         <button className='ap-buttons-add-edit' onClick={() => setIsEditing(true)}><FaPlus /> Добавить преподавателя</button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowRequests(!showRequests)}>
//           {showRequests ? 'Скрыть заявки' : 'Показать заявки'}
//           {newRequestsCount > 0 && <div className="new-request-count-basic"><span className="new-requests-count">{newRequestsCount}</span> </div>}
//         </button>
//         <button className='ap-buttons-add-edit' onClick={() => setShowScheduleEditor(true)}>
//           <FaPlus /> Показать расписание уроков
//         </button>
//         <button className='ap-buttons-add-edit' onClick={toggleUsersList}>
//           {showUsersList ? 'Скрыть пользователей' : 'Показать всех пользователей'}
//         </button>
//         <div className="txt" style={{ fontSize: "18px" }}>
//           📲 Установок приложения: <strong>{pwaInstallCount}</strong>
//         </div>
//       </div>

//       {showUsersList && (
//         <div className="users-list">
//           <h2>Все зарегистрированные пользователи:</h2>
//           {users.length > 0 ? (
//             <ul className="txt">
//               {users.map((user) => (
//                 <li key={user.id} style={{ marginBottom: '8px' }}>
//                   <strong>{user.username}</strong> — {user.email || 'email не указан'}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>Пользователи не найдены.</p>
//           )}
//         </div>
//       )}

//       {isLoading && <div className="loading-bar">Подождите немного...</div>}

//       <h2 style={{ marginTop: "50px" }}>Комментарии пользователей</h2>
//       <div className="admin-buttons-comments">
//         <button className="toggle-comments-btn" onClick={toggleShowComments}>
//           {showComments ? "Скрыть комментарии постов" : "Показать комментарии постов"}
//           {postCommentsCount > 0 && (
//             <span className="comments-count">{postCommentsCount}</span>
//           )}
//         </button>

//         {showComments && (
//           <div className="user-comments-block">
//             <input
//               type="search"
//               placeholder="Поиск комментариев..."
//               className="search-comments"
//               onChange={(e) => setSearchUserCommentQuery(e.target.value)}
//             />
//             <div id="users-comments">
//               {filteredUserComments.map((comment) => (
//                 <div className="adm-user-comment" key={comment.id}>
//                   <img
//                     src={comment.avatarUrl || defaultAvatar}
//                     alt={comment.username}
//                     className="adm-comment-avatar"
//                   />
//                   <div className="adm-comment-details">
//                     <p className="adm-comment-username" onClick={() => goToProfile(comment.userId)}
//                     >
//                       {comment.username}
//                       {comment.username === "Анонимно" && comment.anonymousOwnerId && (
//                         <span> (Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
//                       )}
//                     </p>
//                     <p className="adm-comment-text">{comment.comment}</p>
//                     <span className="adm-comment-timestamp">{comment.timestamp}</span>
//                   </div>
//                   <button
//                     className="delete-comment-btn"
//                     onClick={() => handleDeleteClick(comment.id)}
//                   >
//                     🗑️
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <button className="toggle-comments-btn" onClick={() => setShowTeacherComments(!showTeacherComments)}>
//           {showTeacherComments ? "Скрыть отзывы учителей" : "Показать отзывы учителей"}
//           {teacherCommentsCount > 0 && (
//             <span className="comments-count">{teacherCommentsCount}</span>
//           )}
//         </button>

//         {showTeacherComments && (
//           <div className="users-tch-comments-block">
//             <input
//               type="search"
//               placeholder="Поиск отзывов об учителях..."
//               className="search-teacher-comments"
//               onChange={(e) => setSearchTeacherCommentQuery(e.target.value)}
//             />
//             <div id="users-tch-comments">
//               {filteredTeacherComments.map((comment) => (
//                 <div className="adm-user-comment" key={comment.id}>
//                   <img
//                     src={comment.avatarUrl || defaultAvatar}
//                     alt={comment.username}
//                     className="adm-comment-avatar"
//                     onClick={() => goToProfile(comment.userId)}
//                   />
//                   <div className="adm-comment-details">
//                     <p className="adm-comment-username" onClick={() => goToProfile(comment.userId)}>
//                       {comment.username}
//                       {comment.username === "Анонимно" && comment.anonymousOwnerId && (
//                         <span>(Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
//                       )}
//                     </p>
//                     <p className="adm-comment-text">{comment.comment}</p>
//                     <span className="adm-comment-timestamp">{comment.timestamp}</span>
//                   </div>
//                   <button
//                     className="delete-comment-btn"
//                     onClick={() => openTeacherCommentDeleteModal(comment.id, comment.teacherId)}
//                   >
//                     🗑️
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}


//         <h2 style={{ marginTop: "35px" }}>Заявки Публикаций</h2>
//         <button className="ap-buttons-add-edit" onClick={() => setShowPosts(!showPosts)}>
//           {showPosts ? 'Скрыть посты' : 'Показать посты'}
//           {pendingPostsCount > 0 && <span className="comments-count"> {pendingPostsCount}</span>}
//         </button>

//         {showPosts && (
//           <div id="user-posts">
//             {posts.length > 0 ? (
//               posts.map((post) => (
//                 <div key={post.id} className="adm-post-item">
//                   <div className="adm-post-header">
//                     <img
//                       src={post.userAvatar}
//                       alt={`${post.userName}'s avatar`}
//                       className="adm-user-avatar"
//                       style={{ width: "50px", borderRadius: "50%" }}
//                     />
//                     <div className="adm-user-info">
//                       <span className="adm-user-name">{post.userName}</span>
//                       <span className="adm-post-date">{new Date(post.createdAt).toLocaleString()}</span>
//                     </div>
//                   </div>
//                   <div className="adm-post-content">
//                     {post.mediaUrl && (
//                       <img
//                         src={post.mediaUrl}
//                         alt="Post media"
//                         className="adm-post-media"
//                         style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
//                       />
//                     )}
//                     <p className="adm-post-description">{post.description}</p>
//                   </div>
//                   <div className="adm-post-actions">
//                     <button className="approve-btn" onClick={() => handleApprove(post.id)}>Одобрить</button>
//                     <button className="reject-btn" onClick={() => handleReject(post.id)}>Отклонить</button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p style={{ color: "yellow" }}>Нет ожидающих постов</p>
//             )}
//           </div>
//         )}

//         {confirmTeacherCommentDelete.isOpen && (
//           <div className="delete-confirm-overlay">
//             <div className="delete-confirm-modal">
//               <p>Вы уверены, что хотите удалить отзыв об учителе?</p>
//               <div className="confirm-buttons">
//                 <button onClick={confirmTeacherCommentDeleteAction}>Да</button>
//                 <button onClick={cancelTeacherCommentDelete}>Нет</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {confirmDelete.isOpen && (
//           <div className="delete-confirm-overlay">
//             <div className="delete-confirm-modal">
//               <p>Вы уверены, что хотите удалить комментарий пользователя?</p>
//               <div className="confirm-buttons">
//                 <button onClick={confirmDeleteComment}>Да</button>
//                 <button onClick={cancelDelete}>Нет</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {showRequests && (
//         <div className="ident-requests">
//           <h2>Заявки на идентификацию</h2>
//           <div className="ident-requests-cards">
//             {requests.map((request) => (
//               <div
//                 key={request.id}
//                 className={`request-card ${request.status !== 'pending' ? 'compact-card' : ''}`}
//               >
//                 {/* Новый блок с информацией о пользователе */}
//                 <div
//                   className="request-user-info"
//                   onClick={() => goToProfile(request.userId)}
//                   style={{ cursor: "pointer", display: "flex", alignItems: "center", margin: "10px" }}
//                 >
//                   <img
//                     src={request.userAvatar || defaultAvatar}
//                     alt="Аватар пользователя"
//                     className="request-user-avatar"
//                     style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
//                   />
//                   <p style={{ margin: 0 }}>{request.username}</p>
//                 </div>

//                 {request.status === 'pending' ? (
//                   <div className='request-card-info'>
//                     <p>ФИО: {request.fio}</p>
//                     <p>Кафедра: {request.faculty}</p>
//                     <p>Курс: {request.course}</p>
//                     <p>Группа: {request.group}</p>
//                     {request.photoUrl && (
//                       <img
//                         src={request.photoUrl}
//                         alt="Фото студенческого билета"
//                         className="request-card-photo"
//                         style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
//                       />
//                     )}
//                     <button onClick={() => handleAcceptRequest(request.id)}>Принять</button>
//                     <button
//                       onClick={() => openRejectModal(request.id, request.userId, request.username)}
//                     >
//                       Отклонить
//                     </button>
//                     <button
//                       onClick={() => openDeleteReqModal(request.id, request.username)}
//                       style={{ background: '#d32f2f', color: '#fff' }}
//                     >
//                       Удалить
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="compact-content">
//                     {request.photoUrl && (
//                       <img
//                         src={request.photoUrl}
//                         alt="Фото студента"
//                         className="compact-photo"
//                       />
//                     )}
//                     <div className="compact-info">
//                       <p>{request.fio}</p>
//                       <p className={`status-label ${request.status === 'accepted' ? 'accepted' : 'rejected'}`}>
//                         {request.status === 'accepted' ? 'Идентифицирован' : 'Не идентифицирован'}
//                       </p>
//                     </div>
//                     <FaEdit
//                       className="edit-icon-request-card"
//                       onClick={() => handleEditRequest(request.id)}
//                     />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {rejectModal.isOpen && (
//         <div className="delete-confirm-overlay">
//           <div className="delete-confirm-modal">
//             <p>
//               Укажите причину отклонения заявки пользователя «
//               <strong>{rejectModal.username}</strong>»:
//             </p>
//             <textarea
//               style={{width: "90%", padding: "10px"}}
//               rows={4}
//               value={rejectModal.reason}
//               onChange={e => setRejectModal(prev => ({
//                 ...prev,
//                 reason: e.target.value
//               }))}
//               placeholder="Напишите причину..."
//             />
//             <div className="confirm-buttons">
//               <button
//                 disabled={!rejectModal.reason.trim()}
//                 onClick={confirmRejectSend}
//               >
//                 Отправить
//               </button>
//               <button onClick={cancelReject}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isEditing && !isLoading && (
//         <div className="adm-modal">
//           <div className="adm-modal-content">
//             <h2>{editingTeacherId ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h2>
//             <input
//               type="text"
//               placeholder="Имя"
//               value={newTeacher.name}
//               onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Фамилия"
//               value={newTeacher.surname}
//               onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Предмет"
//               value={newTeacher.subject}
//               onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Статус"
//               value={newTeacher.status}
//               onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Логин"
//               value={newTeacher.login}
//               onChange={(e) => setNewTeacher({ ...newTeacher, login: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Пароль"
//               value={newTeacher.password}
//               onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
//             />
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setPhotoFile(e.target.files[0])}
//             />
//             <div className="adm-modal-buttons">
//               <button onClick={handleSaveTeacher}>{editingTeacherId ? 'Сохранить изменения' : 'Добавить'}</button>
//               <button onClick={() => setIsEditing(false)}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showTeachersList && (
//         <div className="teachers-list">
//           <h2>Список преподавателей</h2>

//           <input
//             className='search-teacherc-input'
//             type="search"
//             placeholder="Поиск преподавателя..."
//             value={searchQuery}
//             onChange={handleSearchChange}
//           />
//           {searchQuery && (
//             <div className="search-suggestions">
//               {filteredTeachers.map(teacher => (
//                 <div
//                   key={teacher.id}
//                   className="suggestion-item"
//                   onClick={() => handleSelectTeacher(teacher)}
//                 >
//                   {teacher.name} {teacher.surname}
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="teachers-grid">
//             {filteredTeachers.map(teacher => (
//               <div key={teacher.id} className="admin-teacher-card">
//                 <div className="card-header">
//                   <img src={teacher.photo || defaultTeacherImg} alt={`${teacher.name} ${teacher.surname}`} />
//                   <FaEdit className="edit-icon" onClick={() => handleEditTeacher(teacher)} />
//                 </div>
//                 <div className="card-body">
//                   <h3>{`${teacher.name} ${teacher.surname}`}</h3>
//                   <p><strong>Предмет:</strong> {teacher.subject}</p>
//                   <p><strong>Статус:</strong> {teacher.status}</p>
//                   <p><strong>Логин:</strong> {teacher.login}</p>
//                   <div className="card-actions">
//                     <button onClick={() => handleDeleteTeacher(teacher.id)}><FaTrash /> Удалить</button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {confirmDeleteReq.isOpen && (
//         <div className="delete-confirm-overlay">
//           <div className="delete-confirm-modal">
//             <p>
//               Вы уверены, что хотите удалить заявку от пользователя «
//               <strong>{confirmDeleteReq.username}</strong>»?
//             </p>
//             <div className="confirm-buttons">
//               <button onClick={confirmDeleteReqAction}>Удалить</button>
//               <button onClick={cancelDeleteReq}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Модальное окно для редактирования расписания выбранной группы */}
//       {showScheduleEditor && (
//         <div className="schedule-modal-overlay">
//           <div className="schedule-modal-content">
//             <h2>Расписание уроков</h2>
//             <label>Выберите курс:</label>
//             <select value={selectedCourse} onChange={handleCourseSelect}>
//               <option value="">-- Выберите курс --</option>
//               <option value="1">1</option>
//               <option value="2">2</option>
//               <option value="3">3</option>
//               <option value="4">4</option>
//             </select>
//             <label>Выберите группу:</label>
//             <select value={selectedGroup} onChange={handleGroupSelect}>
//               <option value="">-- Выберите группу --</option>
//               <option value="1-530102 - АСКИ">1-530102 - АСКИ</option>
//               <option value="1-400101 - ТБТИ">1-400101 - ТБТИ</option>
//               <option value="1-450103-02 - ШАваТИ">1-450103-02 - ШАваТИ</option>
//               <option value="1-400102-04 - ТИваХМ">1-400102-04 - ТИваХМ</option>
//               <option value="1-98010101-03 - ТИваХМ">1-98010101-03 - ТИваХМ</option>
//               <option value="1-98010101-05 - ТИваХМ">1-98010101-05 - ТИваХМ</option>
//               <option value="1-530101 - АРТваИ">1-530101 - АРТваИ</option>
//               <option value="1-530107 - АРТваИ">1-530107 - АРТваИ</option>
//               <option value="1-400301-02 - АРТваИ">1-400301-02 - АРТваИ</option>
//               <option value="1-400301-05 - АРТваИ">1-400301-05 - АРТваИ</option>
//               <option value="1-080101-07 - ИваТХ">1-080101-07 - ИваТХ</option>
//             </select>

//             {selectedCourse && selectedGroup && (
//               <>
//                 {isScheduleLoading ? (
//                   <p>Загрузка расписания...</p>
//                 ) : (
//                   daysOrder.map((dayKey) => (
//                     <div key={dayKey} className="day-schedule">
//                       <h3>{t(dayKey)}</h3>
//                       {scheduleData[dayKey].map((lesson, index) => (
//                         <div key={index} className="lesson-entry">
//                           <input
//                             type="number"
//                             placeholder="Порядок"
//                             value={lesson.order}
//                             onChange={(e) => updateLesson(dayKey, index, 'order', e.target.value)}
//                             className="lesson-input order-input"
//                           />
//                           <input
//                             type="text"
//                             placeholder="Предмет"
//                             value={lesson.subject}
//                             onChange={(e) => updateLesson(dayKey, index, 'subject', e.target.value)}
//                             className="lesson-input subject-input"
//                           />
//                           <input
//                             type="time"
//                             placeholder="Начало"
//                             value={lesson.startTime}
//                             onChange={(e) => updateLesson(dayKey, index, 'startTime', e.target.value)}
//                             className="lesson-input time-input"
//                           />
//                           <input
//                             type="time"
//                             placeholder="Окончание"
//                             value={lesson.endTime}
//                             onChange={(e) => updateLesson(dayKey, index, 'endTime', e.target.value)}
//                             className="lesson-input time-input"
//                           />
//                           <input
//                             type="text"
//                             placeholder="Преподаватель"
//                             value={lesson.teacher}
//                             onChange={(e) => updateLesson(dayKey, index, 'teacher', e.target.value)}
//                             className="lesson-input teacher-input"
//                           />
//                           <button onClick={() => removeLesson(dayKey, index)} className="remove-lesson-btn">
//                             Удалить
//                           </button>
//                         </div>
//                       ))}
//                       <button onClick={() => addLesson(dayKey)} className="add-lesson-btn">
//                         + Добавить урок
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </>
//             )}

//             <div className="schedule-modal-buttons">
//               <button onClick={handleSaveSchedule}>Сохранить расписание</button>
//               <button onClick={() => setShowScheduleEditor(false)}>Отмена</button>
//             </div>
//           </div>
//         </div>
//       )}
//       <ToastContainer />
//     </div>
//   );
// };

// export default AdminPanel;




















import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { getStorage, ref as storageReference, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, set, get, push, update, remove } from "firebase/database";
import imageCompression from 'browser-image-compression';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminPanel.css';
import '../App.css';
import defaultAvatar from "../default-image.png";
import defaultTeacherImg from "../teacher.svg";
import useTranslation from '../hooks/useTranslation';

const initialScheduleData = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

const AdminPanel = () => {
  const [teachers, setTeachers] = useState([]);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const storage = getStorage();
  const database = getDatabase();
  const reference = dbRef(database, 'requests');
  const [userComments, setUserComments] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, commentId: null });
  const [showComments, setShowComments] = useState(false);
  const [teacherComments, setTeacherComments] = useState([]);
  const [showTeacherComments, setShowTeacherComments] = useState(false);
  const [confirmTeacherCommentDelete, setConfirmTeacherCommentDelete] = useState({ isOpen: false, commentId: null, teacherId: null });
  const [userMap, setUserMap] = useState({}); // Словарь userId -> username
  const [postCommentsCount, setPostCommentsCount] = useState(0);
  const [teacherCommentsCount, setTeacherCommentsCount] = useState(0);
  const [searchUserCommentQuery, setSearchUserCommentQuery] = useState("");
  const [filteredUserComments, setFilteredUserComments] = useState([]);
  const [searchTeacherCommentQuery, setSearchTeacherCommentQuery] = useState("");
  const [filteredTeacherComments, setFilteredTeacherComments] = useState([]);
  const [showPosts, setShowPosts] = useState(false);
  const [posts, setPosts] = useState([]);
  const [pendingPostsCount, setPendingPostsCount] = useState(0); // Количество ожидающих постов  
  const navigate = useNavigate();
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [scheduleData, setScheduleData] = useState(initialScheduleData);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(""); // Новое состояние для курса
  const t = useTranslation();
  const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const [pwaInstallCount, setPwaInstallCount] = useState(0);
  const [showUsersList, setShowUsersList] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserActionsOpen, setIsUserActionsOpen] = useState(false);
  const [blockedIPs, setBlockedIPs] = useState({});

  function ipToKey(ip) {
    return ip.replace(/\./g, '_');
  }

  // Загрузим список заблокированных IP один раз
  useEffect(() => {
    const blockRef = dbRef(database, 'blockedIPs');
    onValue(blockRef, snap => {
      setBlockedIPs(snap.val() || {});
    });
  }, []);

  const handleDeleteUser = async (uid) => {
    // полностью удаляем профиль
    await remove(dbRef(database, `users/${uid}`));
    toast.success('Пользователь удалён');
    setIsUserActionsOpen(false);
  };

  const handleBlockUser = async (ip) => {
    const key = ipToKey(ip);
    await set(dbRef(database, `blockedIPs/${key}`), true);
    toast.success(`IP ${ip} заблокирован`);
    setIsUserActionsOpen(false);
  };

  const handleUnblockUser = async (ip) => {
    const key = ipToKey(ip);
    await remove(dbRef(database, `blockedIPs/${key}`));
    toast.success(`IP ${ip} разблокирован`);
    setIsUserActionsOpen(false);
  };


  useEffect(() => {
    const installsRef = dbRef(database, 'pwaInstalls');
    onValue(installsRef, (snapshot) => {
      if (snapshot.exists()) {
        setPwaInstallCount(snapshot.val());
      } else {
        setPwaInstallCount(0);
      }
    });
  }, []);

  const fetchUsers = () => {
    const usersRef = dbRef(database, 'users');
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });
  };

  const toggleUsersList = () => {
    setShowUsersList((prev) => {
      const newState = !prev;
      if (newState) fetchUsers();
      return newState;
    });
  };

  const handleCourseSelect = (e) => {
    const course = e.target.value;
    setSelectedCourse(course);
  };

  // Функция загрузки расписания для выбранной группы
  const loadScheduleForGroup = (group) => {
    setIsScheduleLoading(true);
    const scheduleRef = dbRef(database, `schedules/${group}`);
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setScheduleData(data);
      } else {
        // Если расписание ещё не создано – задаём начальные данные
        setScheduleData(initialScheduleData);
      }
      setIsScheduleLoading(false);
    }, { onlyOnce: true });
  };

  // Сохранение расписания в Firebase
  const handleSaveSchedule = () => {
    if (!selectedGroup || !selectedCourse) {
      toast.error("Пожалуйста, выберите и группу, и курс");
      return;
    }
    const scheduleRef = dbRef(database, `schedules/${selectedCourse}/${selectedGroup}`);
    set(scheduleRef, scheduleData)
      .then(() => {
        toast.success("Расписание успешно сохранено");
        setShowScheduleEditor(false);
      })
      .catch((error) => {
        console.error("Ошибка при сохранении расписания:", error);
        toast.error("Ошибка при сохранении расписания");
      });
  };

  // Обновляем функцию добавления урока, чтобы добавить поле teacher
  const addLesson = (day) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: [...prev[day], { order: '', subject: '', startTime: '', endTime: '', teacher: '' }]
    }));
  };

  // Функция для обновления любого поля урока уже универсальна (работает и с teacher)
  const updateLesson = (day, index, field, value) => {
    setScheduleData(prev => {
      const newDayLessons = [...prev[day]];
      newDayLessons[index] = { ...newDayLessons[index], [field]: value };
      return { ...prev, [day]: newDayLessons };
    });
  };

  // Функция для удаления урока из дня
  const removeLesson = (day, index) => {
    setScheduleData(prev => {
      const newDayLessons = [...prev[day]];
      newDayLessons.splice(index, 1);
      return { ...prev, [day]: newDayLessons };
    });
  };

  // Обработчик выбора группы в селекторе
  const handleGroupSelect = (e) => {
    const group = e.target.value;
    setSelectedGroup(group);
    if (group) {
      loadScheduleForGroup(group);
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const postsRef = dbRef(db, "posts");

    // Подписка на обновления постов
    onValue(postsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = await Promise.all(
          Object.keys(data)
            .map(async (key) => {
              const post = data[key];
              if (post.status !== "pending") return null;

              let userName = post.userName;
              let userAvatar = post.userAvatar;

              if (post.userId) {
                try {
                  const userSnapshot = await get(dbRef(database, `users/${post.userId}`));
                  const userData = userSnapshot.val();
                  if (userData) {
                    userName = userData.username || userName;
                    userAvatar = userData.avatarUrl || userAvatar;
                  }
                } catch (err) {
                  console.error("Ошибка загрузки пользователя:", err);
                }
              }

              return {
                id: key,
                ...post,
                userName,
                userAvatar,
              };
            })
        );

        setPosts(postList.filter(Boolean));
        setPendingPostsCount(postList.filter(Boolean).length);
      }
    });
  }, []);

  const handleApprove = (postId) => {
    const db = getDatabase();
    const postRef = dbRef(db, `posts/${postId}`);
    update(postRef, { status: "approved" }); // Меняем статус на "approved"
    toast.success('Публикация успешно одобрена!');
  };

  const handleReject = (postId) => {
    const db = getDatabase();
    const postRef = dbRef(db, `posts/${postId}`);
    remove(postRef); // Удаляем пост
    toast.success('Публикация успешно отклонена!');
  };

  useEffect(() => {
    const filtered = userComments.filter(
      (comment) =>
        comment.username.toLowerCase().includes(searchUserCommentQuery.toLowerCase()) ||
        comment.comment.toLowerCase().includes(searchUserCommentQuery.toLowerCase())
    );
    setFilteredUserComments(filtered);
  }, [searchUserCommentQuery, userComments]);

  useEffect(() => {
    const filtered = teacherComments.filter(
      (comment) =>
        comment.username.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase()) ||
        comment.comment.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase())
    );
    setFilteredTeacherComments(filtered);
  }, [searchTeacherCommentQuery, teacherComments]);


  useEffect(() => {
    const db = getDatabase();
    const commentsRef = dbRef(db, "comments");

    onValue(commentsRef, async (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        const allComments = [];

        Object.keys(commentsData).forEach((teacherId) => {
          const comments = commentsData[teacherId];
          Object.keys(comments).forEach((commentId) => {
            allComments.push({
              id: commentId,
              teacherId,
              ...comments[commentId],
            });
          });
        });

        // Сортировка по дате
        allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Получение данных о пользователях для анонимных комментариев
        const userIdsToFetch = [
          ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
        ];

        const userPromises = userIdsToFetch.map(async (userId) => {
          const userSnapshot = await get(dbRef(db, `users/${userId}`));
          return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
        });

        const users = await Promise.all(userPromises);
        const userMap = users.reduce((acc, { userId, username }) => {
          acc[userId] = username;
          return acc;
        }, {});

        setUserMap(userMap);
        setTeacherComments(allComments);
      }
    });

    onValue(commentsRef, async (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        let count = 0;

        Object.keys(commentsData).forEach((teacherId) => {
          count += Object.keys(commentsData[teacherId]).length;
        });

        setTeacherCommentsCount(count);
      } else {
        setTeacherCommentsCount(0);
      }
    });
  }, []);

  const handleDeleteTeacherComment = (commentId, teacherId) => {
    const db = getDatabase();
    const commentRef = dbRef(db, `comments/${teacherId}/${commentId}`);

    remove(commentRef)
      .then(() => {
        setTeacherComments((prev) => prev.filter((comment) => comment.id !== commentId));
        toast.success('Комментарий удалён.');
      })
      .catch((error) => {
        console.error("Ошибка при удалении комментария:", error);
        toast.error('Ошибка при удалении комментария.');
      });
  };

  const openTeacherCommentDeleteModal = (commentId, teacherId) => {
    setConfirmTeacherCommentDelete({ isOpen: true, commentId, teacherId });
  };

  const confirmTeacherCommentDeleteAction = () => {
    const { commentId, teacherId } = confirmTeacherCommentDelete;
    if (commentId && teacherId) {
      handleDeleteTeacherComment(commentId, teacherId);
      setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
    }
  };

  const cancelTeacherCommentDelete = () => {
    setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
  };

  useEffect(() => {
    const db = getDatabase();
    const commentsRef = dbRef(db, "postComments");

    onValue(commentsRef, async (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        const allComments = [];

        Object.keys(commentsData).forEach((postId) => {
          const postComments = commentsData[postId];
          Object.keys(postComments).forEach((commentId) => {
            allComments.push({
              id: commentId,
              postId,
              ...postComments[commentId],
            });
          });
        });

        // Сортировка по дате
        allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Получение данных о пользователях для анонимных комментариев
        const userIdsToFetch = [
          ...new Set(allComments.map((comment) => comment.anonymousOwnerId).filter(Boolean)),
        ];

        const userPromises = userIdsToFetch.map(async (userId) => {
          const userSnapshot = await get(dbRef(db, `users/${userId}`));
          return { userId, username: userSnapshot.val()?.username || "Неизвестный" };
        });

        const users = await Promise.all(userPromises);
        const userMap = users.reduce((acc, { userId, username }) => {
          acc[userId] = username;
          return acc;
        }, {});

        setUserMap(userMap);
        setUserComments(allComments);
      }
    });

    onValue(commentsRef, async (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        let count = 0;

        Object.keys(commentsData).forEach((postId) => {
          count += Object.keys(commentsData[postId]).length;
        });

        setPostCommentsCount(count);
      } else {
        setPostCommentsCount(0);
      }
    });
  }, []);

  const confirmDeleteComment = () => {
    const db = getDatabase();
    const { commentId } = confirmDelete;

    if (commentId) {
      const comment = userComments.find((c) => c.id === commentId);

      if (comment) {
        const commentRef = dbRef(db, `postComments/${comment.postId}/${comment.id}`);
        const postRef = dbRef(db, `posts/${comment.postId}`);

        remove(commentRef)
          .then(() => {
            // Пересчет количества комментариев
            onValue(dbRef(db, `postComments/${comment.postId}`), (snapshot) => {
              const commentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
              update(postRef, { commentCount })
                .then(() => {
                  setUserComments((prevComments) =>
                    prevComments.filter((c) => c.id !== commentId)
                  );
                  setConfirmDelete({ isOpen: false, commentId: null });
                })
                .catch((error) => {
                  console.error("Ошибка при обновлении количества комментариев:", error);
                });
            }, { onlyOnce: true });
          })
          .catch((error) => {
            console.error("Ошибка при удалении комментария:", error);
          });
      }
    }
  };

  const handleDeleteClick = (commentId) => {
    setConfirmDelete({ isOpen: true, commentId });
  };

  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, commentId: null });
  };

  const toggleShowComments = () => {
    setShowComments((prev) => !prev);
  };

  useEffect(() => {
    const teachersRef = dbRef(database, 'teachers');
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTeachers = Object.keys(data).map(id => ({ id, ...data[id] }));
        setTeachers(loadedTeachers);
        setFilteredTeachers(loadedTeachers);
      } else {
        setTeachers([]);
      }
    });
  }, [database]);

  // const formattedData = await Promise.all(
  //   Object.keys(data).map(async (key) => {
  //     // Берем данные заявки
  //     const request = { id: key, ...data[key], status: data[key].status || 'pending' };
  //     // Если заявка в статусе "pending", проверяем роль отправителя
  //     if (request.status === 'pending') {
  //       const userSnapshot = await get(dbRef(database, `users/${request.senderId}`));
  //       const userData = userSnapshot.val();
  //       if (userData && userData.role === 'dean') {
  //         // Если отправитель — декан, обновляем статус заявки автоматически
  //         await update(dbRef(database, `requests/${key}`), { status: "accepted" });
  //         request.status = "accepted";
  //       }
  //     }
  //     return request;
  //   })
  // );

  // useEffect(() => {
  //   const requestsRef = dbRef(database, "requests");
  //   onValue(requestsRef, async (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const formattedData = await Promise.all(
  //                 Object.keys(data).map(async key => {
  //                   const raw = data[key];
  //                   // базовый объект заявки
  //                   const request = {
  //                     id: key,
  //                     ...raw,
  //                     status: raw.status || 'pending'
  //                   };

  //                   // 1) подтягиваем имя/аватар из users/<senderId>
  //                   try {
  //                     const userSnap = await get(dbRef(database, `users/${request.senderId}`));
  //                     const userData = userSnap.val();
  //                     if (userData) {
  //                       request.username    = userData.username;
  //                       request.userAvatar  = userData.avatarUrl;
  //                     }
  //                   } catch (err) {
  //                     console.warn("Не удалось загрузить профиль отправителя:", err);
  //                   }

  //                   // 2) оставляем вашу логику авто-принятия для декана
  //                   if (request.status === 'pending') {
  //                     const senderSnap = await get(dbRef(database, `users/${request.senderId}`));
  //                     const senderData = senderSnap.val();
  //                     if (senderData?.role === 'dean') {
  //                       await update(dbRef(database, `requests/${key}`), { status: "accepted" });
  //                       request.status = "accepted";
  //                     }
  //                   }

  //                   return request;
  //                 })
  //               );
  //       setRequests(formattedData);
  //       setNewRequestsCount(formattedData.filter(req => req.status === 'pending').length);
  //     }
  //   });
  // }, [database]);

  useEffect(() => {
    const requestsRef = dbRef(database, "requests");
    onValue(requestsRef, async (snapshot) => {
      const data = snapshot.val();
      let formattedData = [];

      if (data) {
        formattedData = await Promise.all(
          Object.keys(data).map(async key => {
            const raw = data[key];
            const request = {
              id: key,
              ...raw,
              status: raw.status || 'pending'
            };

            // подгружаем профиль отправителя
            try {
              const userSnap = await get(dbRef(database, `users/${request.senderId}`));
              const userData = userSnap.val();
              if (userData) {
                request.username = userData.username;
                request.userAvatar = userData.avatarUrl;
                request.role = userData.role;      // <-- сохраняем роль
              }
            } catch (err) {
              console.warn("Не удалось загрузить профиль отправителя:", err);
            }

            // авто-принятие для декана
            if (request.status === 'pending' && request.role === 'dean') {
              await update(dbRef(database, `requests/${key}`), { status: "accepted" });
              request.status = "accepted";
            }

            return request;
          })
        );

        // фильтруем: оставляем только либо заявки преподавателей, либо у которых есть fio
        formattedData = formattedData.filter(req =>
          req.role === 'teacher' ||
          (typeof req.fio === 'string' && req.fio.trim() !== '')
        );
      }

      setRequests(formattedData);
      setNewRequestsCount(formattedData.filter(r => r.status === 'pending').length);
    });
  }, [database]);

  const handleRequestStatusChange = async (userId, status) => {
    try {
      const userRef = dbRef(database, `users/${userId}`);
      await update(userRef, { identificationStatus: status });
      toast.success(`Заявка ${status === "verified" ? "принята" : "отклонена"}`);
    } catch (error) {
      console.error("Ошибка при обновлении статуса заявки:", error);
    }
  };

  const handleAcceptRequest = (id) => {
    update(dbRef(database, `requests/${id}`), { status: "accepted" })
      .then(() => {
        const acceptedRequest = requests.find(req => req.id === id);

        // Обновляем статус идентификации пользователя
        const userRef = dbRef(database, `users/${acceptedRequest.userId}`);
        update(userRef, { identificationStatus: 'accepted' });

        if (acceptedRequest && acceptedRequest.group && acceptedRequest.course) {
          const groupKey = acceptedRequest.group;
          const courseKey = acceptedRequest.course;
          const groupRef = push(dbRef(database, `groups/${courseKey}/${groupKey}`));
          set(groupRef, {
            ...acceptedRequest,
            userAvatar: acceptedRequest.userAvatar || acceptedRequest.photoUrl || defaultAvatar
          });
        }

        setRequests(prevRequests =>
          prevRequests.map(request =>
            request.id === id ? { ...request, status: "accepted" } : request
          )
        );
        setNewRequestsCount(prevCount => prevCount - 1);
        toast.success('Заявка принята');
      })
      .catch(error => {
        console.error("Ошибка при принятии заявки:", error);
        toast.error('Ошибка при принятии заявки');
      });
  };

  const handleRejectRequest = (id) => {
    update(dbRef(database, `requests/${id}`), { status: "rejected" });
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "rejected" } : request
      )
    );
    setNewRequestsCount((prevCount) => prevCount - 1);
    toast.error('Заявка отклонена');
  };

  const handleEditRequest = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: "pending" } : request
      )
    );
    toast.info('Заявка возвращена для редактирования');
  };

  // 1) Добавьте в начало компонента новые состояния и функции:

  const [confirmDeleteReq, setConfirmDeleteReq] = useState({
    isOpen: false,
    id: null,
    username: '',
  });

  // Открыть модалку удаления
  const openDeleteReqModal = (id, username) => {
    setConfirmDeleteReq({ isOpen: true, id, username });
  };

  // Подтвердить удаление
  const confirmDeleteReqAction = () => {
    const { id } = confirmDeleteReq;
    if (!id) return;
    // Удаляем заявку из базы
    remove(dbRef(database, `requests/${id}`))
      .then(() => {
        // Убираем из локального состояния
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success('Заявка успешно удалена');
      })
      .catch(err => {
        console.error(err);
        toast.error('Ошибка при удалении заявки');
      })
      .finally(() => {
        setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
      });
  };

  // Отменить удаление
  const cancelDeleteReq = () => {
    setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
  };

  // state для модалки отклонения
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    id: null,
    senderId: null,
    username: '',
    reason: ''
  });

  // открыть модалку
  const openRejectModal = (id, senderId, username) => {
    setRejectModal({ isOpen: true, id, senderId, username, reason: '' });
  };

  // отмена отклонения
  const cancelReject = () => {
    setRejectModal({ isOpen: false, id: null, senderId: null, username: '', reason: '' });
  };

  // отправка причины отклонения
  const confirmRejectSend = async () => {
    const { id, senderId, reason } = rejectModal;
    if (!reason.trim()) return;

    // 0) Обновляем статус пользователя
    await update(dbRef(database, `users/${senderId}`), {
      identificationStatus: 'rejected'
    });

    // 1) обновляем статус заявки
    await update(dbRef(database, `requests/${id}`), { status: 'rejected' });

    // 2) опционально обновим статус в профиле пользователя
    await update(dbRef(database, `users/${senderId}`), { identificationStatus: 'rejected' });

    // 3) формируем и пушим уведомление
    const notification = {
      type: 'identification_rejected',
      message: reason,
      timestamp: new Date().toISOString(),
    };
    await push(dbRef(database, `notifications/${senderId}`), notification);

    // 4) обновляем локальный стейт списка заявок
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'rejected' } : r
    ));

    // 5) закрываем модалку
    cancelReject();
    toast.success('Заявка откланена! Пользователю отправлено уведомление о причины!');
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.log("Ошибка при сжатии изображения:", error);
      return file;
    }
  };

  const handleSaveTeacher = async () => {
    if (newTeacher.name && newTeacher.surname && newTeacher.subject && newTeacher.login && newTeacher.password) {
      setIsLoading(true);
      let photoURL = '';
      if (photoFile) {
        const compressedPhoto = await compressImage(photoFile);
        const fileRef = storageReference(storage, `teachers/${compressedPhoto.name}`);
        await uploadBytes(fileRef, compressedPhoto);
        photoURL = await getDownloadURL(fileRef);
      }

      const teacherData = { ...newTeacher, photo: photoURL };

      if (editingTeacherId) {
        const updatedTeachers = teachers.map(t =>
          t.id === editingTeacherId ? { ...t, ...teacherData } : t
        );
        setTeachers(updatedTeachers);

        const teacherRef = dbRef(database, `teachers/${editingTeacherId}`);
        await update(teacherRef, teacherData);
        window.location.reload();
        toast.success('Преподаватель успешно изменен!');
      } else {
        const teachersRef = dbRef(database, 'teachers');
        const newTeacherRef = push(teachersRef);
        await set(newTeacherRef, teacherData);
        toast.success('Преподаватель успешно добавлен!');
      }

      setIsEditing(false);
      setNewTeacher({ name: '', surname: '', subject: '', status: '', login: '', password: '' });
      setPhotoFile(null);
      setEditingTeacherId(null);
      setIsLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setNewTeacher(teacher);
    setEditingTeacherId(teacher.id);
    setIsEditing(true);
  };

  const handleDeleteTeacher = async (id) => {
    setTeachers(teachers.filter(t => t.id !== id));
    const teacherRef = dbRef(database, `teachers/${id}`);
    await remove(teacherRef);
    toast.success('Преподаватель успешно удален!');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const searchFiltered = teachers.filter((teacher) => {
      const name = teacher.name || "";
      return (
        name.toLowerCase().includes(query)
      );
    });
    setFilteredTeachers(searchFiltered);
  };

  const handleSelectTeacher = (teacher) => {
    setFilteredTeachers([teacher]);
  };

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="admin-panel">
      <h1>Административная панель</h1>

      <div className="admin-buttons">
        <button className='ap-buttons-add-edit' onClick={() => setIsEditing(true)}><FaPlus /> Добавить преподавателя</button>
        <button className='ap-buttons-add-edit' onClick={() => setShowTeachersList(!showTeachersList)}>Показать список преподавателей</button>
        <button className='ap-buttons-add-edit' onClick={() => setShowRequests(!showRequests)}>
          {showRequests ? 'Скрыть заявки' : 'Показать заявки'}
          {newRequestsCount > 0 && <div className="new-request-count-basic"><span className="new-requests-count">{newRequestsCount}</span> </div>}
        </button>
        <button className='ap-buttons-add-edit' onClick={() => setShowScheduleEditor(true)}>
          <FaPlus /> Показать расписание уроков
        </button>
        <button className='ap-buttons-add-edit' onClick={toggleUsersList}>
          {showUsersList ? 'Скрыть пользователей' : 'Показать всех пользователей'}
        </button>
        <div className="txt" style={{ fontSize: "18px" }}>
          📲 Установок приложения: <strong>{pwaInstallCount}</strong>
        </div>
      </div>

      {showUsersList && (
        <div className="users-list">
          <h2>Все зарегистрированные пользователи:</h2>
          <ul className="txt">
            {users.map(user => (
              <li key={user.id} style={{ display: 'flex', alignItems: 'center', padding: "5px", borderBottom: "1px solid grey" }}>
                <div style={{ flex: 1 }}>
                  <strong>{user.username}</strong> — {user.email || 'email не указан'}
                </div>
                <FaEdit
                  style={{ cursor: 'pointer', marginLeft: 8 }}
                  onClick={() => {
                    setSelectedUser(user);
                    setIsUserActionsOpen(true);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {isUserActionsOpen && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-window">
            <h3>Действие для «{selectedUser.username}»</h3>
            <button
              onClick={() => {
                if (window.confirm('Вы точно хотите удалить этого пользователя?')) {
                  handleDeleteUser(selectedUser.id);
                }
              }}
            >
              Удалить аккаунт
            </button>
            {blockedIPs[selectedUser.ipAddress]
              ? <button
                onClick={() => {
                  if (window.confirm(`Разблокировать IP ${selectedUser.ipAddress}?`)) {
                    handleUnblockUser(selectedUser.ipAddress);
                  }
                }}
              >
                Разблокировать по IP
              </button>
              : <button
                onClick={() => {
                  if (window.confirm(`Заблокировать IP ${selectedUser.ipAddress}?`)) {
                    handleBlockUser(selectedUser.ipAddress);
                  }
                }}
              >
                Заблокировать по IP {selectedUser.ipAddress}
              </button>
            }
            <button onClick={() => setIsUserActionsOpen(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {isLoading && <div className="loading-bar">Подождите немного...</div>}

      <h2 style={{ marginTop: "50px" }}>Комментарии пользователей</h2>
      <div className="admin-buttons-comments">
        <button className="toggle-comments-btn" onClick={toggleShowComments}>
          {showComments ? "Скрыть комментарии постов" : "Показать комментарии постов"}
          {postCommentsCount > 0 && (
            <span className="comments-count">{postCommentsCount}</span>
          )}
        </button>

        {showComments && (
          <div className="user-comments-block">
            <input
              type="search"
              placeholder="Поиск комментариев..."
              className="search-comments"
              onChange={(e) => setSearchUserCommentQuery(e.target.value)}
            />
            <div id="users-comments">
              {filteredUserComments.map((comment) => (
                <div className="adm-user-comment" key={comment.id}>
                  <img
                    src={comment.avatarUrl || defaultAvatar}
                    alt={comment.username}
                    className="adm-comment-avatar"
                  />
                  <div className="adm-comment-details">
                    <p className="adm-comment-username" onClick={() => goToProfile(comment.userId)}
                    >
                      {comment.username}
                      {comment.username === "Анонимно" && comment.anonymousOwnerId && (
                        <span> (Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
                      )}
                    </p>
                    <p className="adm-comment-text">{comment.comment}</p>
                    <span className="adm-comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <button
                    className="delete-comment-btn"
                    onClick={() => handleDeleteClick(comment.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="toggle-comments-btn" onClick={() => setShowTeacherComments(!showTeacherComments)}>
          {showTeacherComments ? "Скрыть отзывы учителей" : "Показать отзывы учителей"}
          {teacherCommentsCount > 0 && (
            <span className="comments-count">{teacherCommentsCount}</span>
          )}
        </button>

        {showTeacherComments && (
          <div className="users-tch-comments-block">
            <input
              type="search"
              placeholder="Поиск отзывов об учителях..."
              className="search-teacher-comments"
              onChange={(e) => setSearchTeacherCommentQuery(e.target.value)}
            />
            <div id="users-tch-comments">
              {filteredTeacherComments.map((comment) => (
                <div className="adm-user-comment" key={comment.id}>
                  <img
                    src={comment.avatarUrl || defaultAvatar}
                    alt={comment.username}
                    className="adm-comment-avatar"
                    onClick={() => goToProfile(comment.userId)}
                  />
                  <div className="adm-comment-details">
                    <p className="adm-comment-username" onClick={() => goToProfile(comment.userId)}>
                      {comment.username}
                      {comment.username === "Анонимно" && comment.anonymousOwnerId && (
                        <span>(Автор: {userMap[comment.anonymousOwnerId] || "Загрузка..."})</span>
                      )}
                    </p>
                    <p className="adm-comment-text">{comment.comment}</p>
                    <span className="adm-comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <button
                    className="delete-comment-btn"
                    onClick={() => openTeacherCommentDeleteModal(comment.id, comment.teacherId)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        <h2 style={{ marginTop: "35px" }}>Заявки Публикаций</h2>
        <button className="ap-buttons-add-edit" onClick={() => setShowPosts(!showPosts)}>
          {showPosts ? 'Скрыть посты' : 'Показать посты'}
          {pendingPostsCount > 0 && <span className="comments-count"> {pendingPostsCount}</span>}
        </button>

        {showPosts && (
          <div id="user-posts">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="adm-post-item">
                  <div className="adm-post-header">
                    <img
                      src={post.userAvatar}
                      alt={`${post.userName}'s avatar`}
                      className="adm-user-avatar"
                      style={{ width: "50px", borderRadius: "50%" }}
                    />
                    <div className="adm-user-info">
                      <span className="adm-user-name">{post.userName}</span>
                      <span className="adm-post-date">{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="adm-post-content">
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="adm-post-media"
                        style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                      />
                    )}
                    <p className="adm-post-description">{post.description}</p>
                  </div>
                  <div className="adm-post-actions">
                    <button className="approve-btn" onClick={() => handleApprove(post.id)}>Одобрить</button>
                    <button className="reject-btn" onClick={() => handleReject(post.id)}>Отклонить</button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "yellow" }}>Нет ожидающих постов</p>
            )}
          </div>
        )}

        {confirmTeacherCommentDelete.isOpen && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <p>Вы уверены, что хотите удалить отзыв об учителе?</p>
              <div className="confirm-buttons">
                <button onClick={confirmTeacherCommentDeleteAction}>Да</button>
                <button onClick={cancelTeacherCommentDelete}>Нет</button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete.isOpen && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <p>Вы уверены, что хотите удалить комментарий пользователя?</p>
              <div className="confirm-buttons">
                <button onClick={confirmDeleteComment}>Да</button>
                <button onClick={cancelDelete}>Нет</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showRequests && (
        <div className="ident-requests">
          <h2>Заявки на идентификацию</h2>
          <div className="ident-requests-cards">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`request-card ${request.status !== 'pending' ? 'compact-card' : ''}`}
              >
                {/* Новый блок с информацией о пользователе */}
                <div
                  className="request-user-info"
                  onClick={() => goToProfile(request.userId)}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", margin: "10px" }}
                >
                  <img
                    src={request.userAvatar || defaultAvatar}
                    alt="Аватар пользователя"
                    className="request-user-avatar"
                    style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                  />
                  <p style={{ margin: 0 }}>{request.username}</p>
                </div>

                {request.status === 'pending' ? (
                  <div className='request-card-info'>
                    <p>ФИО: {request.fio}</p>
                    <p>Кафедра: {request.faculty}</p>
                    <p>Курс: {request.course}</p>
                    <p>Группа: {request.group}</p>
                    {request.photoUrl && (
                      <img
                        src={request.photoUrl}
                        alt="Фото студенческого билета"
                        className="request-card-photo"
                        style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
                      />
                    )}
                    <button onClick={() => handleAcceptRequest(request.id)}>Принять</button>
                    <button
                      onClick={() => openRejectModal(request.id, request.userId, request.username)}
                    >
                      Отклонить
                    </button>
                    <button
                      onClick={() => openDeleteReqModal(request.id, request.username)}
                      style={{ background: '#d32f2f', color: '#fff' }}
                    >
                      Удалить
                    </button>
                  </div>
                ) : (
                  <div className="compact-content">
                    {request.photoUrl && (
                      <img
                        src={request.photoUrl}
                        alt="Фото студента"
                        className="compact-photo"
                      />
                    )}
                    <div className="compact-info">
                      <p>{request.fio}</p>
                      <p className={`status-label ${request.status === 'accepted' ? 'accepted' : 'rejected'}`}>
                        {request.status === 'accepted' ? 'Идентифицирован' : 'Не идентифицирован'}
                      </p>
                    </div>
                    <FaEdit
                      className="edit-icon-request-card"
                      onClick={() => handleEditRequest(request.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rejectModal.isOpen && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>
              Укажите причину отклонения заявки пользователя «
              <strong>{rejectModal.username}</strong>»:
            </p>
            <textarea
              style={{ width: "90%", padding: "10px" }}
              rows={4}
              value={rejectModal.reason}
              onChange={e => setRejectModal(prev => ({
                ...prev,
                reason: e.target.value
              }))}
              placeholder="Напишите причину..."
            />
            <div className="confirm-buttons">
              <button
                disabled={!rejectModal.reason.trim()}
                onClick={confirmRejectSend}
              >
                Отправить
              </button>
              <button onClick={cancelReject}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {isEditing && !isLoading && (
        <div className="adm-modal">
          <div className="adm-modal-content">
            <h2>{editingTeacherId ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h2>
            <input
              type="text"
              placeholder="Имя"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Фамилия"
              value={newTeacher.surname}
              onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })}
            />
            <input
              type="text"
              placeholder="Предмет"
              value={newTeacher.subject}
              onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
            />
            <input
              type="text"
              placeholder="Статус"
              value={newTeacher.status}
              onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value })}
            />
            <input
              type="text"
              placeholder="Логин"
              value={newTeacher.login}
              onChange={(e) => setNewTeacher({ ...newTeacher, login: e.target.value })}
            />
            <input
              type="text"
              placeholder="Пароль"
              value={newTeacher.password}
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
            />
            <div className="adm-modal-buttons">
              <button onClick={handleSaveTeacher}>{editingTeacherId ? 'Сохранить изменения' : 'Добавить'}</button>
              <button onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showTeachersList && (
        <div className="teachers-list">
          <h2>Список преподавателей</h2>

          <input
            className='search-teacherc-input'
            type="search"
            placeholder="Поиск преподавателя..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <div className="search-suggestions">
              {filteredTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className="suggestion-item"
                  onClick={() => handleSelectTeacher(teacher)}
                >
                  {teacher.name}
                </div>
              ))}
            </div>
          )}

          <div className="teachers-grid">
            {filteredTeachers.map(teacher => (
              <div key={teacher.id} className="admin-teacher-card">
                <div className="card-header">
                  <img src={teacher.photo || defaultTeacherImg} alt={`${teacher.name}`} />
                  <FaEdit className="edit-icon" onClick={() => handleEditTeacher(teacher)} />
                </div>
                <div className="card-body">
                  <h3>{`${teacher.name}`}</h3>
                  <p><strong>Предмет:</strong> {teacher.subject}</p>
                  <p><strong>Статус:</strong> {teacher.status}</p>
                  <p><strong>Логин:</strong> {teacher.login}</p>
                  <div className="card-actions">
                    <button onClick={() => handleDeleteTeacher(teacher.id)}><FaTrash /> Удалить</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmDeleteReq.isOpen && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>
              Вы уверены, что хотите удалить заявку от пользователя «
              <strong>{confirmDeleteReq.username}</strong>»?
            </p>
            <div className="confirm-buttons">
              <button onClick={confirmDeleteReqAction}>Удалить</button>
              <button onClick={cancelDeleteReq}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для редактирования расписания выбранной группы */}
      {showScheduleEditor && (
        <div className="schedule-modal-overlay">
          <div className="schedule-modal-content">
            <h2>Расписание уроков</h2>
            <label>Выберите курс:</label>
            <select value={selectedCourse} onChange={handleCourseSelect}>
              <option value="">-- Выберите курс --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            <label>Выберите группу:</label>
            <select value={selectedGroup} onChange={handleGroupSelect}>
              <option value="">-- Выберите группу --</option>
              <option value="1-530102 - АСКИ">1-530102 - АСКИ</option>
              <option value="1-400101 - ТБТИ">1-400101 - ТБТИ</option>
              <option value="1-450103-02 - ШАваТИ">1-450103-02 - ШАваТИ</option>
              <option value="1-400102-04 - ТИваХМ">1-400102-04 - ТИваХМ</option>
              <option value="1-98010101-03 - ТИваХМ">1-98010101-03 - ТИваХМ</option>
              <option value="1-98010101-05 - ТИваХМ">1-98010101-05 - ТИваХМ</option>
              <option value="1-530101 - АРТваИ">1-530101 - АРТваИ</option>
              <option value="1-530107 - АРТваИ">1-530107 - АРТваИ</option>
              <option value="1-400301-02 - АРТваИ">1-400301-02 - АРТваИ</option>
              <option value="1-400301-05 - АРТваИ">1-400301-05 - АРТваИ</option>
              <option value="1-080101-07 - ИваТХ">1-080101-07 - ИваТХ</option>
            </select>

            {selectedCourse && selectedGroup && (
              <>
                {isScheduleLoading ? (
                  <p>Загрузка расписания...</p>
                ) : (
                  daysOrder.map((dayKey) => (
                    <div key={dayKey} className="day-schedule">
                      <h3>{t(dayKey)}</h3>
                      {scheduleData[dayKey].map((lesson, index) => (
                        <div key={index} className="lesson-entry">
                          <input
                            type="number"
                            placeholder="Порядок"
                            value={lesson.order}
                            onChange={(e) => updateLesson(dayKey, index, 'order', e.target.value)}
                            className="lesson-input order-input"
                          />
                          <input
                            type="text"
                            placeholder="Предмет"
                            value={lesson.subject}
                            onChange={(e) => updateLesson(dayKey, index, 'subject', e.target.value)}
                            className="lesson-input subject-input"
                          />
                          <input
                            type="time"
                            placeholder="Начало"
                            value={lesson.startTime}
                            onChange={(e) => updateLesson(dayKey, index, 'startTime', e.target.value)}
                            className="lesson-input time-input"
                          />
                          <input
                            type="time"
                            placeholder="Окончание"
                            value={lesson.endTime}
                            onChange={(e) => updateLesson(dayKey, index, 'endTime', e.target.value)}
                            className="lesson-input time-input"
                          />
                          <input
                            type="text"
                            placeholder="Преподаватель"
                            value={lesson.teacher}
                            onChange={(e) => updateLesson(dayKey, index, 'teacher', e.target.value)}
                            className="lesson-input teacher-input"
                          />
                          <button onClick={() => removeLesson(dayKey, index)} className="remove-lesson-btn">
                            Удалить
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addLesson(dayKey)} className="add-lesson-btn">
                        + Добавить урок
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            <div className="schedule-modal-buttons">
              <button onClick={handleSaveSchedule}>Сохранить расписание</button>
              <button onClick={() => setShowScheduleEditor(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminPanel;