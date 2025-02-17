// import { onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
// import { ref as storageRef, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import { ref as databaseRef, onValue, push, update, get, query, orderByChild, equalTo } from "firebase/database";
// import React, { useEffect, useState, useRef } from "react";
// import { auth, database, storage } from "../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import { FaEllipsisV, FaTimes, FaPen, FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaRegAddressBook } from "react-icons/fa"; // Иконка карандаша
// import imageCompression from 'browser-image-compression';

// const AuthDetails = () => {
//   const [authUser, setAuthUser] = useState(null);
//   const [username, setUsername] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [showMenu, setShowMenu] = useState(false);
//   const [newUsername, setNewUsername] = useState("");
//   const [isEditingUsername, setIsEditingUsername] = useState(false);
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const [aboutMe, setAboutMe] = useState("Информация не указана");
//   const [newAboutMe, setNewAboutMe] = useState("");
//   const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
//   const [notification, setNotification] = useState(""); // Для уведомления
//   const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
//   const menuRef = useRef(null);
//   const navigate = useNavigate();

//   const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
//   const [requestId, setRequestId] = useState(null); // New state for tracking request ID
//   const user = auth.currentUser;

//    // Состояние для формы заявки
//    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
//    const [studentInfo, setStudentInfo] = useState({
//      fio: "",
//      faculty: "",
//      course: "",
//      group: "",
//      photo: null,
//    });

//    const handleOpenForm = () => {
//     if (identificationStatus === "не идентифицирован") {
//       setIsRequestFormOpen(true);
//     } else {
//       showNotification("Вы уже идентифицированы.");
//     }
//   };
//    const handleCloseForm = () => setIsRequestFormOpen(false);

//    const handleInputChange = (e) => {
//      const { name, value } = e.target;
//      setStudentInfo((prev) => ({ ...prev, [name]: value }));
//    };

//    const handleFileChange = (e) => {
//      setStudentInfo((prev) => ({ ...prev, photo: e.target.files[0] }));
//    };

//    const handleSubmitRequest = async () => {
//     const { fio, faculty, course, group, photo } = studentInfo;

//     // Проверка на пустые поля
//     if (!fio || !faculty || !course || !group || !photo) {
//       showNotificationError("Все поля обязательны к заполнению.");
//       return;
//     }

//     try {
//       // Отправка фото студента в Firebase Storage (если выбрано)
//       let photoUrl = "";
//       if (photo) {
//         const storageReference = ref(storage, `request_photos/${Date.now()}_${photo.name}`);
//         const snapshot = await uploadBytes(storageReference, photo);
//         photoUrl = await getDownloadURL(snapshot.ref);
//       }

//       // Сохранение данных заявки в Firebase Database
//       const requestRef = push(databaseRef(database, "requests"));
//       await update(requestRef, {
//         fio,
//         faculty,
//         course,
//         group,
//         photoUrl,
//         status: "pending",
//         email: authUser.email // Save the user's email to link request with user
//       });

//       setRequestId(requestRef.key); // Set the request ID state
//       handleCloseForm();
//       showNotification("Заявка отправлена успешно.");
//     } catch (error) {
//       console.error("Ошибка отправки заявки:", error);
//       showNotificationError("Ошибка отправки заявки.");
//     }
//   };


//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     const listen = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthUser(user);
//         setEmail(user.email);

//         const userRef = databaseRef(database, 'users/' + user.uid);
//         onValue(userRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             setUsername(data.username || "User");
//             setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
//             setStatus(data.status || "offline");
//             setLastActive(data.lastActive || "");
//             setAvatarUrl(data.avatarUrl || "./default-image.png");
//             setAboutMe(data.aboutMe || "Информация не указана");
//           }
//         });


//                 // Подписка на изменения статуса заявки пользователя
//                 const requestRef = query(
//                   databaseRef(database, "requests"),
//                   orderByChild("email"),
//                   equalTo(user.email)
//                 );
//                 onValue(requestRef, (snapshot) => {
//                   if (snapshot.exists()) {
//                     const requestData = Object.values(snapshot.val())[0];
//                     setRequestId(requestData.id); // Get request ID
//                     setIdentificationStatus(
//                       requestData.status === "accepted" ? "идентифицирован" : "не идентифицирован"
//                     );
//                   } else {
//                     setRequestId(null); // No request found
//                     setIdentificationStatus("не идентифицирован");
//                   }
//                 });

//         // Устанавливаем статус "online" при входе
//         update(userRef, { status: "online" });

//         // Отслеживаем активность приложения
//         const handleVisibilityChange = () => {
//           if (document.visibilityState === "hidden") {
//             // Когда вкладка не активна
//             update(userRef, { 
//               status: "offline", 
//               lastActive: new Date().toLocaleString() 
//             });
//           } else {
//             // Когда вкладка активна
//             update(userRef, { status: "online" });
//           }
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);

//         // Обновляем статус при закрытии окна
//         window.addEventListener('beforeunload', () => {
//           update(userRef, { 
//             status: "offline", 
//             lastActive: new Date().toLocaleString() 
//           });
//         });
//       } else {
//         setAuthUser(null);
//         setUsername("");
//         setEmail("");
//         setPhoneNumber("");
//         setStatus("offline");
//         setLastActive("");
//         setAvatarUrl("./default-image.png");
//       }
//     });

//     return () => {
//       listen();
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//  // Функция для успешных уведомлений
//  const showNotification = (message) => {
//   setNotificationType("success");
//   setNotification(message);
//   setTimeout(() => {
//     setNotification("");
//     setNotificationType("");
//   }, 3000);
// };

// // Функция для ошибочных уведомлений
// const showNotificationError = (message) => {
//   setNotificationType("error");
//   setNotification(message);
//   setTimeout(() => {
//     setNotification("");
//     setNotificationType("");
//   }, 3000);
// };

// const handleAvatarChange = async (e) => {
//   const file = e.target.files[0];
//   if (file && authUser) {
//     try {
//       // Опции для сжатия изображения
//       const options = {
//         maxSizeMB: 1, // Максимальный размер файла 1 МБ
//         maxWidthOrHeight: 800, // Максимальная ширина или высота изображения
//         useWebWorker: true,
//       };

//       // Сжимаем изображение
//       const compressedFile = await imageCompression(file, options);

//       // Загружаем сжатое изображение в Firebase
//       const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
//       const snapshot = await uploadBytes(avatarStorageRef, compressedFile);
//       const downloadURL = await getDownloadURL(avatarStorageRef);

//       // Обновляем аватар пользователя
//       setAvatarUrl(downloadURL);
//       const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//       await update(userDatabaseRef, { avatarUrl: downloadURL });

//       setShowMenu(false);
//       showNotification("Фото профиля успешно обновлено.");
//     } catch (error) {
//       console.error("Ошибка при загрузке изображения:", error);
//       showNotificationError("Ошибка при загрузке фото.");
//     }
//   }
// };

//   const renderStatus = () => {
//     if (status === "online") {
//       return <span className="status-online">в сети</span>;
//     } else {
//       return <span className="status-offline">был(а) в сети: {lastActive}</span>;
//     }
//   };

//   const handleContextMenu = (event) => {
//     event.preventDefault();
//   }

//   return (
//     <div className="profile-container">
//       {authUser ? (
//         <div className="profile-content">
//           {notification && (
//             <div className={`notification ${notificationType}`}>
//               {notification}
//             </div>
//           )} {/* Уведомление */}

//           <div className="profile-header">

//           <Link className="back-button" onClick={() => navigate(-1)}>
//             <FaArrowLeft />
//           </Link>

//             <div className="avatar-section">
//               <img
//                 src={avatarUrl}
//                 alt="Avatar"
//                 className="avatar"
//                 onClick={() => setIsAvatarModalOpen(true)}
//                 onContextMenu={handleContextMenu}
//               />
//               <input
//                 type="file"
//                 id="avatarInput"
//                 accept="image/*"
//                 style={{ display: 'none' }}
//               />
//             </div>

//             <div className="username-section">
//               <h2>{username}</h2>
//               <p style={{color: "lightgreen"}}>{renderStatus()}</p>
//             </div>

//             <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//               <FaEllipsisV />
//             </div>

//           </div>

//           <div className="profile-info">
//             <div className="info-section account">
//               <div>
//               <h3>Номер телефона</h3>
//               <p>{phoneNumber}</p>
//               </div>
//               <FaRegAddressBook style={{fontSize: "22px"}} />
//             </div>

//             <div className="info-section osebe" 
//             onClick={() => setIsEditingAboutMe(true)}>
//              <div>
//              <h3>О себе</h3>
//              <p>{aboutMe}</p>
//              </div>
//              <FaPen
//                className="edit-icon-auth"
//                style={{ marginLeft: '10px', cursor: 'pointer' }}
//              />   
//            </div>

//             <div className="info-section">
//             <div className="ident-block-basic" onClick={handleOpenForm}>
//                 <div className="ident-block1">
//               <h3>Идентификация</h3>
//               <p>{identificationStatus}</p>
//                 </div>
//                 <div className="ident-block2">
//                 <FaLock style={{ color: identificationStatus === "идентифицирован" ? '#0AFFFF' : 'red' }} />
//                 </div>
//             </div>
//             </div>

//           </div>
//        </div>
//      ) : (
//         <h2 className="signed-out-h2" data-text="T I K">T I K</h2>
//      )}
//    </div>
//   );
// };      

// export default AuthDetails;






// import { onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
// import { ref as storageRef, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import { ref as databaseRef, onValue, push, update, get, query, orderByChild, equalTo } from "firebase/database";
// import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
// import React, { useEffect, useState, useRef } from "react";
// import { auth, database, storage } from "../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import { FaEllipsisV, FaTimes, FaPen, FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaRegAddressBook } from "react-icons/fa"; // Иконка карандаша
// import { color } from "framer-motion";
// import imageCompression from 'browser-image-compression';

// const AuthDetails = () => {
//   const [authUser, setAuthUser] = useState(null);
//   const [username, setUsername] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [showMenu, setShowMenu] = useState(false);
//   const [newUsername, setNewUsername] = useState("");
//   const [isEditingUsername, setIsEditingUsername] = useState(false);
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const [aboutMe, setAboutMe] = useState("Информация не указана");
//   const [newAboutMe, setNewAboutMe] = useState("");
//   const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
//   const [notification, setNotification] = useState(""); // Для уведомления
//   const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
//   const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false); // Состояние для модального окна телефона
//   const [newPhoneNumber, setNewPhoneNumber] = useState("+992"); // Для хранения нового номера телефона
//   const menuRef = useRef(null);

//   const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);

//   const navigate = useNavigate();

//   const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
//   const [requestId, setRequestId] = useState(null); // New state for tracking request ID
//   const user = auth.currentUser;

//    // Состояние для формы заявки
//    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
//    const [studentInfo, setStudentInfo] = useState({
//      fio: "",
//      faculty: "",
//      course: "",
//      group: "",
//      photo: null,
//    });

//    const handleOpenForm = () => {
//     if (identificationStatus === "не идентифицирован") {
//       setIsRequestFormOpen(true);
//     } else {
//       showNotification("Вы уже идентифицированы.");
//     }
//   };
//    const handleCloseForm = () => setIsRequestFormOpen(false);

//    const handleInputChange = (e) => {
//      const { name, value } = e.target;
//      setStudentInfo((prev) => ({ ...prev, [name]: value }));
//    };

//    const handleFileChange = (e) => {
//      setStudentInfo((prev) => ({ ...prev, photo: e.target.files[0] }));
//    };

//    const handleSubmitRequest = async () => {
//     const { fio, faculty, course, group, photo } = studentInfo;

//     // Проверка на пустые поля
//     if (!fio || !faculty || !course || !group || !photo) {
//       showNotificationError("Все поля обязательны к заполнению.");
//       return;
//     }

//     try {
//       // Отправка фото студента в Firebase Storage (если выбрано)
//       let photoUrl = "";
//       if (photo) {
//         const storageReference = ref(storage, `request_photos/${Date.now()}_${photo.name}`);
//         const snapshot = await uploadBytes(storageReference, photo);
//         photoUrl = await getDownloadURL(snapshot.ref);
//       }

//       // Сохранение данных заявки в Firebase Database
//       const requestRef = push(databaseRef(database, "requests"));
//       await update(requestRef, {
//         fio,
//         faculty,
//         course,
//         group,
//         photoUrl,
//         status: "pending",
//         email: authUser.email // Save the user's email to link request with user
//       });

//       setRequestId(requestRef.key); // Set the request ID state
//       handleCloseForm();
//       showNotification("Заявка отправлена успешно.");
//     } catch (error) {
//       console.error("Ошибка отправки заявки:", error);
//       showNotificationError("Ошибка отправки заявки.");
//     }
//   };


//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     const listen = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthUser(user);
//         setEmail(user.email);

//         const userRef = databaseRef(database, 'users/' + user.uid);
//         onValue(userRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             setUsername(data.username || "User");
//             setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
//             setStatus(data.status || "offline");
//             setLastActive(data.lastActive || "");
//             setAvatarUrl(data.avatarUrl || "./default-image.png");
//             setAboutMe(data.aboutMe || "Информация не указана");
//           }
//         });


//                 // Подписка на изменения статуса заявки пользователя
//                 const requestRef = query(
//                   databaseRef(database, "requests"),
//                   orderByChild("email"),
//                   equalTo(user.email)
//                 );
//                 onValue(requestRef, (snapshot) => {
//                   if (snapshot.exists()) {
//                     const requestData = Object.values(snapshot.val())[0];
//                     setRequestId(requestData.id); // Get request ID
//                     setIdentificationStatus(
//                       requestData.status === "accepted" ? "идентифицирован" : "не идентифицирован"
//                     );
//                   } else {
//                     setRequestId(null); // No request found
//                     setIdentificationStatus("не идентифицирован");
//                   }
//                 });

//         // Устанавливаем статус "online" при входе
//         update(userRef, { status: "online" });

//         // Отслеживаем активность приложения
//         const handleVisibilityChange = () => {
//           if (document.visibilityState === "hidden") {
//             // Когда вкладка не активна
//             update(userRef, { 
//               status: "offline", 
//               lastActive: new Date().toLocaleString() 
//             });
//           } else {
//             // Когда вкладка активна
//             update(userRef, { status: "online" });
//           }
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);

//         // Обновляем статус при закрытии окна
//         window.addEventListener('beforeunload', () => {
//           update(userRef, { 
//             status: "offline", 
//             lastActive: new Date().toLocaleString() 
//           });
//         });
//       } else {
//         setAuthUser(null);
//         setUsername("");
//         setEmail("");
//         setPhoneNumber("");
//         setStatus("offline");
//         setLastActive("");
//         setAvatarUrl("./default-image.png");
//       }
//     });

//     return () => {
//       listen();
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//     // Открытие модального окна для изменения телефона
//     const handlePhoneModalOpen = () => {
//       setNewPhoneNumber("+992");
//       setIsPhoneModalOpen(true);
//     };

//     // Сохранение нового или измененного номера телефона
//     const handleSavePhoneNumber = async () => {
//       if (!newPhoneNumber || newPhoneNumber === "+992") {
//         setPhoneNumber("Добавить номер телефона");
//         setIsPhoneModalOpen(false); // Закрытие модального окна после сохранения
//         return;
//       }

//       if (authUser) {
//         try {
//           const userRef = databaseRef(database, 'users/' + authUser.uid);
//           await update(userRef, { phoneNumber: newPhoneNumber });
//           setPhoneNumber(newPhoneNumber);
//           showNotification("Номер телефона успешно обновлен.");
//           setIsPhoneModalOpen(false); // Закрытие модального окна после сохранения
//         } catch (error) {
//           console.error("Ошибка при обновлении номера телефона:", error);
//         }
//       }
//     };


//  // Функция для успешных уведомлений
//  const showNotification = (message) => {
//   setNotificationType("success");
//   setNotification(message);
//   setTimeout(() => {
//     setNotification("");
//     setNotificationType("");
//   }, 3000);
// };

// // Функция для ошибочных уведомлений
// const showNotificationError = (message) => {
//   setNotificationType("error");
//   setNotification(message);
//   setTimeout(() => {
//     setNotification("");
//     setNotificationType("");
//   }, 3000);
// };

// const handleAvatarChange = async (e) => {
//   const file = e.target.files[0];
//   if (file && authUser) {
//     try {
//       // Опции для сжатия изображения
//       const options = {
//         maxSizeMB: 1, // Максимальный размер файла 1 МБ
//         maxWidthOrHeight: 800, // Максимальная ширина или высота изображения
//         useWebWorker: true,
//       };

//       // Сжимаем изображение
//       const compressedFile = await imageCompression(file, options);

//       // Загружаем сжатое изображение в Firebase
//       const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
//       const snapshot = await uploadBytes(avatarStorageRef, compressedFile);
//       const downloadURL = await getDownloadURL(avatarStorageRef);

//       // Обновляем аватар пользователя
//       setAvatarUrl(downloadURL);
//       const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//       await update(userDatabaseRef, { avatarUrl: downloadURL });

//       setShowMenu(false);
//       showNotification("Фото профиля успешно обновлено.");
//     } catch (error) {
//       console.error("Ошибка при загрузке изображения:", error);
//       showNotificationError("Ошибка при загрузке фото.");
//     }
//   }
// };

// const deleteAvatar = async () => {
//   if (authUser) {
//     try {
//       const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
//       await deleteObject(avatarStorageRef);
//       const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//       await update(userDatabaseRef, { avatarUrl: "./default-image.png" });
//       setAvatarUrl("./default-image.png");
//       setShowMenu(false);
//     } catch (error) {
//       console.error("Ошибка при удалении изображения:", error);
//     }
//   }
// };

// const handleUsernameChange = async () => {
//   const usernameRegex = /^[a-zA-Z0-9._]+$/; // Валидация имени пользователя
//   if (authUser && newUsername.trim() !== "" && usernameRegex.test(newUsername)) {
//     try {
//       // Проверяем, существует ли уже пользователь с таким именем
//       const usersRef = query(databaseRef(database, 'users'), orderByChild('username'), equalTo(newUsername));
//       const snapshot = await get(usersRef);
//       if (snapshot.exists()) {
//         showNotificationError("Пользователь с таким именем уже существует, выберите другое имя.");
//         return;
//       }

//       // Если имя уникально, обновляем
//       const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//       await update(userDatabaseRef, { username: newUsername });
//       setUsername(newUsername);
//       setIsEditingUsername(false);
//       showNotification(`Имя изменено на "${newUsername}"`);
//     } catch (error) {
//       console.error("Ошибка при изменении имени пользователя:", error);
//     }
//   } else {
//     showNotificationError("Имя пользователя может содержать только буквы, цифры, нижнее подчеркивание и точку.");
//   }
// };

// const handleAboutMeChange = async () => {
//   if (authUser) {
//     const aboutText = newAboutMe.trim() === "" ? "Информация не указана" : newAboutMe;
//     try {
//       const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//       await update(userDatabaseRef, { aboutMe: aboutText });
//       setAboutMe(aboutText);
//       setIsEditingAboutMe(false);
//       showNotification(`Информация "О себе" обновлена`);
//     } catch (error) {
//       console.error("Ошибка при изменении информации 'О себе':", error);
//     }
//   }
// };


//   const userSignOut = () => {
//     const userRef = databaseRef(database, 'users/' + authUser.uid);
//     update(userRef, { 
//       status: "offline", 
//       lastActive: new Date().toLocaleString() 
//     }).then(() => {
//       signOut(auth).then(() => console.log("Successfully signed out!")).catch((e) => console.log(e));
//     });
//   };

//   const renderStatus = () => {
//     if (status === "online") {
//       return <span className="status-online">в сети</span>;
//     } else {
//       return <span className="status-offline">был(а) в сети: {lastActive}</span>;
//     }
//   };


//   const openPasswordModal = () => {
//     setIsPasswordModalOpen(true);
//     setCurrentPassword("");
//     setNewPassword("");
//     setPasswordError("");
//   };

//   const handleChangePassword = async () => {
//     if (!authUser) return;

//     const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
//     try {
//       await reauthenticateWithCredential(authUser, credential);
//       await updatePassword(authUser, newPassword);
//       showNotification("Пароль успешно изменен.");
//       setIsPasswordModalOpen(false);
//     } catch (error) {
//       setPasswordError("Текущий пароль неверный.");
//     }
//   };

//   const handleContextMenu = (event) => {
//     event.preventDefault();
//   }

//   return (
//     <div className="profile-container" onContextMenu={handleContextMenu}>
//       {authUser ? (
//         <div className="profile-content">
//           {notification && (
//             <div className={`notification ${notificationType}`}>
//               {notification}
//             </div>
//           )} {/* Уведомление */}

//           <div className="profile-header">

//           <Link className="back-button" onClick={() => navigate(-1)}>
//             <FaArrowLeft />
//           </Link>

//             <div className="avatar-section">
//               <img
//                 src={avatarUrl}
//                 alt="Avatar"
//                 className="avatar"
//                 onClick={() => setIsAvatarModalOpen(true)}
//                 onContextMenu={handleContextMenu}
//               />
//               <label htmlFor="avatarInput" className="avatar-upload-btn">Загрузить фото</label>
//               <input
//                 type="file"
//                 id="avatarInput"
//                 accept="image/*"
//                 onChange={handleAvatarChange}
//                 style={{ display: 'none' }}
//               />
//             </div>

//             <div className="username-section">
//               <h2>{username}</h2>
//               <p style={{color: "lightgreen"}}>{renderStatus()}</p>
//             </div>

//             <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//               <FaEllipsisV />
//             </div>

//             {showMenu && (
//               <div className="menu-dropdown" ref={menuRef}>
//                 <button onClick={() => document.getElementById('avatarInput').click()}>Добавить фото профиля</button>
//                 <button onClick={deleteAvatar}>Удалить фото профиля</button>
//                 <button onClick={() => setIsEditingUsername(true)}>Изменить имя пользователя</button>
//               </div>
//             )}

//           </div>

//           {isEditingUsername && (
//             <div className="edit-username-section">
//               <input
//                 type="text"
//                 value={newUsername}
//                 onChange={(e) => setNewUsername(e.target.value)}
//                 placeholder="Новое имя пользователя"
//               />
//               <button style={{height: "35px"}} onClick={handleUsernameChange}>Изменить</button>
//               <FaTimes className="close-icon" onClick={() => setIsEditingUsername(false)} /> {/* Кнопка крестика */}
//             </div>
//           )}

//           <div className="profile-info">
//             <div className="info-section account" onClick={handlePhoneModalOpen}>
//               <div>
//               <h3>Номер телефона</h3>
//               <p>{phoneNumber}</p>
//               </div>
//               <FaRegAddressBook style={{fontSize: "22px"}} />
//             </div>

//                       {/* Модальное окно для изменения телефона */}
//           {isPhoneModalOpen && (
//             <div className="modal-phone-overlay">
//               <div className="modal-phone">
//                 <h2>{phoneNumber === "+Введите номер телефона" ? "Добавить номер телефона" : "Изменить номер телефона"}</h2>
//                 <input
//                   type="text"
//                   value={newPhoneNumber}
//                   onChange={(e) => setNewPhoneNumber(e.target.value)}
//                   placeholder="Введите номер телефона"
//                 />
//                 <button onClick={handleSavePhoneNumber}>Сохранить</button>
//                 <FaTimes className="close-icon" onClick={() => setIsPhoneModalOpen(false)} />
//               </div>
//             </div>
//           )}

//             <div className="info-section osebe" 
//             onClick={() => setIsEditingAboutMe(true)}>
//              <div>
//              <h3>О себе</h3>
//              <p>{aboutMe}</p>
//              </div>
//              <FaPen
//                className="edit-icon-auth"
//                style={{ marginLeft: '10px', cursor: 'pointer' }}
//              />   
//            </div>

//            {isEditingAboutMe && (
//              <div className="edit-aboutme-section">
//                <div className="ci-txt">
//                <textarea
//                  type="text"
//                  value={newAboutMe}
//                  onChange={(e) => setNewAboutMe(e.target.value)}
//                  placeholder="Расскажите о себе"
//                />
//                <FaTimes className="close-icon" onClick={() => setIsEditingAboutMe(false)} /> {/* Кнопка крестика */}
//                </div>
//                <button onClick={handleAboutMeChange}>Сохранить</button>
//              </div>
//            )}

//             <div className="info-section">
//             <div className="ident-block-basic" onClick={handleOpenForm}>
//                 <div className="ident-block1">
//               <h3>Идентификация</h3>
//               <p>{identificationStatus}</p>
//                 </div>
//                 <div className="ident-block2">
//                 <FaLock style={{ color: identificationStatus === "идентифицирован" ? '#0AFFFF' : 'red' }} />
//                 </div>
//             </div>
//             </div>

//             {isRequestFormOpen && (
//               <div className="request-form-modal">
//                 <div className="form-content">
//                   <h2>Идентификация студента</h2>
//                   <input type="text" name="fio" placeholder="ФИО" onChange={handleInputChange} required />
//                   <input type="text" name="faculty" placeholder="Факультет" onChange={handleInputChange} required />
//                   <input type="text" name="course" placeholder="Курс" onChange={handleInputChange} required />
//                   <input type="text" name="group" placeholder="Группа" onChange={handleInputChange} required />
//                   <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
//                   <button onClick={handleSubmitRequest}>Отправить</button>
//                   <button onClick={handleCloseForm}>Закрыть</button>
//                 </div>
//               </div>
//             )}

//             <div className="info-section">
//               <h3>Электронная почта</h3>
//               <p>{email}</p>
//             </div>

//             <div className="settings">
//               <h3>Настройки</h3>
//               <ul>
//                 <li>Конфиденциальность</li>
//                 <li>Уведомления и звуки</li>
//                 <div className="edit-password" onClick={openPasswordModal}>
//                 <li>Пароль</li>
//                 <FaPen />
//                 </div>
//           {isPasswordModalOpen && (
//             <div className="password-modal">
//               <div className="password-modal-content">
//                 <h2>Изменение пароля</h2>
//                 <div className="password-input-container">
//                 <input
//                   type={showCurrentPassword ? "text" : "password"}
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                   placeholder="Введите текущий пароль"
//                 />
//                 <div
//                   className="eye-icon"
//                   onClick={() => setShowCurrentPassword((prev) => !prev)}
//                 >
//                   {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
//                 </div>
//               </div>

//                {/* Поле для нового пароля */}
//                <div className="password-input-container">
//                  <input
//                    type={showNewPassword ? "text" : "password"}
//                    value={newPassword}
//                    onChange={(e) => setNewPassword(e.target.value)}
//                    placeholder="Введите новый пароль"
//                  />
//                  <div
//                    className="eye-icon"
//                    onClick={() => setShowNewPassword((prev) => !prev)}
//                  >
//                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
//                  </div>
//                </div>
//                 <div className="password-modal-buttons">
//                   <button onClick={handleChangePassword}>Изменить</button>
//                   <button onClick={() => setIsPasswordModalOpen(false)}>Отмена</button>
//                 </div>
//               </div>
//             </div>
//           )}
//                 <li>Язык</li>
//               </ul>
//             </div>
//           </div>

//           <button className="signout-btn" onClick={userSignOut}>Выйти из аккаунта</button>

//           {isAvatarModalOpen && (
//            <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//              <div className="avatar-overlay">
//                <img
//                  src={avatarUrl}
//                  alt="Avatar"
//                  className="full-size-avatar"
//                  onClick={() => setIsAvatarModalOpen(false)}
//                  onContextMenu={handleContextMenu}
//                />
//              </div>
//            </div>
//          )}
//        </div>
//      ) : (
//         <div className="signed-out-container">
//         <div className="signed-out">
//         <h2 className="signed-out-h2" data-text="T I K">T I K</h2>
//         <p style={{color: "white", fontSize: "25px"}}>Вы вышли из аккаунта</p>
//         <Link className="authoutlink" to="/">Войти в аккаунт</Link>
//         </div>
//         </div>
//      )}
//    </div>
//   );
// };      

// export default AuthDetails;





















import { onAuthStateChanged, signOut, getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { getStorage, ref as storageRef, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref as databaseRef, onValue, push, update, get, query, orderByChild, equalTo, remove } from "firebase/database";
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from "react";
import { auth, database, storage } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FaEllipsisV, FaTimes, FaPen, FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaRegAddressBook } from "react-icons/fa"; // Иконка карандаша
import imageCompression from 'browser-image-compression';
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [showMenu, setShowMenu] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [aboutMe, setAboutMe] = useState("Информация не указана");
  const [newAboutMe, setNewAboutMe] = useState("");
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false); // Состояние для модального окна телефона
  const [newPhoneNumber, setNewPhoneNumber] = useState("+992"); // Для хранения нового номера телефона
  const menuRef = useRef(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  const navigate = useNavigate();

  const [identificationStatus, setIdentificationStatus] = useState("не идентифицирован");
  const [requestId, setRequestId] = useState(null); // New state for tracking request ID
  const user = auth.currentUser;

  // Состояние для формы заявки
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    fio: "",
    faculty: "",
    course: "",
    group: "",
    photo: null,
  });

  const handleOpenForm = () => {
    if (identificationStatus === "не идентифицирован") {
      setIsRequestFormOpen(true);
    } else {
      showNotification("Вы уже идентифицированы.");
    }
  };
  const handleCloseForm = () => setIsRequestFormOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setStudentInfo((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmitRequest = async () => {
    const { fio, faculty, course, group, photo } = studentInfo;

    // Проверка на пустые поля
    if (!fio || !faculty || !course || !group || !photo) {
      showNotificationError("Все поля обязательны к заполнению.");
      return;
    }

    try {
      // Отправка фото студента в Firebase Storage (если выбрано)
      let photoUrl = "";
      if (photo) {
        const storageReference = ref(storage, `request_photos/${Date.now()}_${photo.name}`);
        const snapshot = await uploadBytes(storageReference, photo);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      // Сохранение данных заявки в Firebase Database
      const requestRef = push(databaseRef(database, "requests"));
      await update(requestRef, {
        fio,
        faculty,
        course,
        group,
        photoUrl,
        status: "pending",
        email: authUser.email // Save the user's email to link request with user
      });

      setRequestId(requestRef.key); // Set the request ID state
      handleCloseForm();
      showNotification("Заявка отправлена успешно.");
    } catch (error) {
      console.error("Ошибка отправки заявки:", error);
      showNotificationError("Ошибка отправки заявки.");
    }
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setEmail(user.email);

        const userRef = databaseRef(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername(data.username || "User");
            setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
            setStatus(data.status || "offline");
            setLastActive(data.lastActive || "");
            setAvatarUrl(data.avatarUrl || "./default-image.png");
            setAboutMe(data.aboutMe || "Информация не указана");
          }
        });


        // Подписка на изменения статуса заявки пользователя
        const requestRef = query(
          databaseRef(database, "requests"),
          orderByChild("email"),
          equalTo(user.email)
        );
        onValue(requestRef, (snapshot) => {
          if (snapshot.exists()) {
            const requestData = Object.values(snapshot.val())[0];
            setRequestId(requestData.id); // Get request ID
            setIdentificationStatus(
              requestData.status === "accepted" ? "идентифицирован" : "не идентифицирован"
            );
          } else {
            setRequestId(null); // No request found
            setIdentificationStatus("не идентифицирован");
          }
        });

        // Устанавливаем статус "online" при входе
        update(userRef, { status: "online" });

        // Отслеживаем активность приложения
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            // Когда вкладка не активна
            update(userRef, {
              status: "offline",
              lastActive: new Date().toLocaleString()
            });
          } else {
            // Когда вкладка активна
            update(userRef, { status: "online" });
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Обновляем статус при закрытии окна
        window.addEventListener('beforeunload', () => {
          update(userRef, {
            status: "offline",
            lastActive: new Date().toLocaleString()
          });
        });
      } else {
        setAuthUser(null);
        setUsername("");
        setEmail("");
        setPhoneNumber("");
        setStatus("offline");
        setLastActive("");
        setAvatarUrl("./default-image.png");
      }
    });

    return () => {
      listen();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Открытие модального окна для изменения телефона
  const handlePhoneModalOpen = () => {
    setNewPhoneNumber("+992");
    setIsPhoneModalOpen(true);
  };

  // Сохранение нового или измененного номера телефона
  const handleSavePhoneNumber = async () => {
    if (!newPhoneNumber || newPhoneNumber === "+992") {
      setPhoneNumber("Добавить номер телефона");
      setIsPhoneModalOpen(false); // Закрытие модального окна после сохранения
      return;
    }

    if (authUser) {
      try {
        const userRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userRef, { phoneNumber: newPhoneNumber });
        setPhoneNumber(newPhoneNumber);
        showNotification("Номер телефона успешно обновлен.");
        setIsPhoneModalOpen(false); // Закрытие модального окна после сохранения
      } catch (error) {
        console.error("Ошибка при обновлении номера телефона:", error);
      }
    }
  };


  // Функция для успешных уведомлений
  const showNotification = (message) => {
    setNotificationType("success");
    setNotification(message);
    setTimeout(() => {
      setNotification("");
      setNotificationType("");
    }, 3000);
  };

  // Функция для ошибочных уведомлений
  const showNotificationError = (message) => {
    setNotificationType("error");
    setNotification(message);
    setTimeout(() => {
      setNotification("");
      setNotificationType("");
    }, 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && authUser) {
      try {
        // Опции для сжатия изображения
        const options = {
          maxSizeMB: 1, // Максимальный размер файла 1 МБ
          maxWidthOrHeight: 800, // Максимальная ширина или высота изображения
          useWebWorker: true,
        };

        // Сжимаем изображение
        const compressedFile = await imageCompression(file, options);

        // Загружаем сжатое изображение в Firebase
        const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
        const snapshot = await uploadBytes(avatarStorageRef, compressedFile);
        const downloadURL = await getDownloadURL(avatarStorageRef);

        // Обновляем аватар пользователя
        setAvatarUrl(downloadURL);
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { avatarUrl: downloadURL });

        setShowMenu(false);
        showNotification("Фото профиля успешно обновлено.");
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
        showNotificationError("Ошибка при загрузке фото.");
      }
    }
  };

  const deleteAvatar = async () => {
    if (authUser) {
      try {
        const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
        await deleteObject(avatarStorageRef);
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { avatarUrl: "./default-image.png" });
        setAvatarUrl("./default-image.png");
        setShowMenu(false);
      } catch (error) {
        console.error("Ошибка при удалении изображения:", error);
      }
    }
  };

  const handleUsernameChange = async () => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/; // Валидация имени пользователя
    if (authUser && newUsername.trim() !== "" && usernameRegex.test(newUsername)) {
      try {
        // Проверяем, существует ли уже пользователь с таким именем
        const usersRef = query(databaseRef(database, 'users'), orderByChild('username'), equalTo(newUsername));
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          showNotificationError("Пользователь с таким именем уже существует, выберите другое имя.");
          return;
        }

        // Если имя уникально, обновляем
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { username: newUsername });
        setUsername(newUsername);
        setIsEditingUsername(false);
        showNotification(`Имя изменено на "${newUsername}"`);
      } catch (error) {
        console.error("Ошибка при изменении имени пользователя:", error);
      }
    } else {
      showNotificationError("Имя пользователя может содержать только буквы, цифры, нижнее подчеркивание и точку.");
    }
  };

  const handleAboutMeChange = async () => {
    if (authUser) {
      const aboutText = newAboutMe.trim() === "" ? "Информация не указана" : newAboutMe;
      try {
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { aboutMe: aboutText });
        setAboutMe(aboutText);
        setIsEditingAboutMe(false);
        showNotification(`Информация "О себе" обновлена`);
      } catch (error) {
        console.error("Ошибка при изменении информации 'О себе':", error);
      }
    }
  };


  const userSignOut = () => {
    const userRef = databaseRef(database, 'users/' + authUser.uid);
    update(userRef, {
      status: "offline",
      lastActive: new Date().toLocaleString()
    }).then(() => {
      signOut(auth).then(() => console.log("Successfully signed out!")).catch((e) => console.log(e));
    });
  };

  const deleteAccount = async () => {
    if (!authUser) return;

    const userId = authUser.uid; // Сохраняем UID для дальнейшего использования
    const userRef = databaseRef(database, 'users/' + userId);
    const avatarRef = storageRef(storage, `avatars/${userId}`);

    try {
      // Сначала выйти из аккаунта
      await signOut(auth);
      showNotification("Вы вышли из аккаунта.");

      // Удалить аватар из Firebase Storage
      await deleteObject(avatarRef).catch((error) => {
        console.warn("Ошибка удаления аватара:", error);
      });

      // Удалить данные из Realtime Database
      await remove(userRef).catch((error) => {
        console.error("Ошибка удаления данных из базы данных:", error);
      });

      showNotification("Аккаунт успешно удалён.");
      navigate("/"); // Перенаправить на главную страницу
    } catch (error) {
      console.error("Ошибка при удалении аккаунта:", error);
      showNotificationError("Не удалось удалить аккаунт. Пожалуйста, попробуйте снова.");
    }
  };


  const renderStatus = () => {
    if (status === "online") {
      return <span className="status-online">в сети</span>;
    } else {
      return <span className="status-offline">был(а) в сети: {lastActive}</span>;
    }
  };


  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setCurrentPassword("");
    setNewPassword("");
    setPasswordError("");
  };

  const handleChangePassword = async () => {
    if (!authUser) return;

    const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
    try {
      await reauthenticateWithCredential(authUser, credential);
      await updatePassword(authUser, newPassword);
      showNotification("Пароль успешно изменен.");
      setIsPasswordModalOpen(false);
    } catch (error) {
      setPasswordError("Текущий пароль неверный.");
    }
  };

  return (
    <div className="profile-container">
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
          <Link to="/" className="menu-item">
            <FiHome className="menu-icon" />
            {isMenuOpen && <span>Главная</span>}
          </Link>
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
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" />
            {isMenuOpen && <span>Профиль</span>}
          </Link>
          <Link to="/chats" className="menu-item">
            <FiMessageSquare className="menu-icon" />
            {isMenuOpen && <span>Сообщения</span>}
          </Link>
          <Link to="/notifications" className="menu-item">
            <FiBell className="menu-icon" />
            {isMenuOpen && <span>Уведомления</span>}
          </Link>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" style={{ borderBottom: "1px solid rgb(200, 255, 0)", borderRadius: "15px", padding: "5px" }} />
            {isMenuOpen && <span>Настройки</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
          <img
            src={basiclogo}
            alt="logo"
            className="tiklogo"
          />
          {isMenuOpen && (
            <span style={{ fontSize: "35px", fontWeight: "bold", color: "#9daddf" }}>TIK</span>
          )}
        </div>
      </div>
      {authUser ? (
        <div className="profile-content">
          {notification && (
            <div className={`notification ${notificationType}`}>
              {notification}
            </div>
          )} {/* Уведомление */}

          <div className="profile-header">

            <Link className="back-button" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </Link>

            <div className="avatar-section">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
                onClick={() => setIsAvatarModalOpen(true)}
              />
              <label htmlFor="avatarInput" className="avatar-upload-btn">Загрузить фото</label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="username-section">
              <h2>{username}</h2>
              <p style={{ color: "lightgreen" }}>{renderStatus()}</p>
            </div>

            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown" ref={menuRef}>
                <button onClick={() => document.getElementById('avatarInput').click()}>Добавить фото профиля</button>
                <button onClick={deleteAvatar}>Удалить фото профиля</button>
                <button onClick={() => setIsEditingUsername(true)}>Изменить имя пользователя</button>
              </div>
            )}

          </div>

          {isEditingUsername && (
            <div className="edit-username-section">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Новое имя пользователя"
              />
              <button style={{ height: "35px" }} onClick={handleUsernameChange}>Изменить</button>
              <FaTimes className="close-icon" onClick={() => setIsEditingUsername(false)} /> {/* Кнопка крестика */}
            </div>
          )}

          <div className="profile-info">
            <div className="info-section account" onClick={handlePhoneModalOpen}>
              <div>
                <h3>Номер телефона</h3>
                <p>{phoneNumber}</p>
              </div>
              <FaRegAddressBook style={{ fontSize: "22px" }} />
            </div>

            {/* Модальное окно для изменения телефона */}
            {isPhoneModalOpen && (
              <div className="modal-phone-overlay">
                <div className="modal-phone">
                  <h2>{phoneNumber === "+Введите номер телефона" ? "Добавить номер телефона" : "Изменить номер телефона"}</h2>
                  <input
                    type="text"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="Введите номер телефона"
                  />
                  <button onClick={handleSavePhoneNumber}>Сохранить</button>
                  <FaTimes className="close-icon" onClick={() => setIsPhoneModalOpen(false)} />
                </div>
              </div>
            )}

            <div className="info-section osebe"
              onClick={() => setIsEditingAboutMe(true)}>
              <div>
                <h3>О себе</h3>
                <p>{aboutMe}</p>
              </div>
              <FaPen
                className="edit-icon-auth"
                style={{ marginLeft: '10px', cursor: 'pointer' }}
              />
            </div>

            {isEditingAboutMe && (
              <div className="edit-aboutme-section">
                <div className="ci-txt">
                  <textarea
                    type="text"
                    value={newAboutMe}
                    onChange={(e) => setNewAboutMe(e.target.value)}
                    placeholder="Расскажите о себе"
                  />
                  <FaTimes className="close-icon" onClick={() => setIsEditingAboutMe(false)} /> {/* Кнопка крестика */}
                </div>
                <button onClick={handleAboutMeChange}>Сохранить</button>
              </div>
            )}

            <div className="info-section">
              <div className="ident-block-basic" onClick={handleOpenForm}>
                <div className="ident-block1">
                  <h3>Идентификация</h3>
                  <p>{identificationStatus}</p>
                </div>
                <div className="ident-block2">
                  <FaLock style={{ color: identificationStatus === "идентифицирован" ? '#0AFFFF' : 'red' }} />
                </div>
              </div>
            </div>

            {isRequestFormOpen && (
              <div className="request-form-modal">
                <div className="form-content">
                  <h2>Идентификация студента</h2>
                  <input type="text" name="fio" placeholder="ФИО" onChange={handleInputChange} required />
                  <input type="text" name="faculty" placeholder="Факультет" onChange={handleInputChange} required />
                  <input type="text" name="course" placeholder="Курс" onChange={handleInputChange} required />
                  <input type="text" name="group" placeholder="Группа" onChange={handleInputChange} required />
                  <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
                  <button onClick={handleSubmitRequest}>Отправить</button>
                  <button onClick={handleCloseForm}>Закрыть</button>
                </div>
              </div>
            )}

            <div className="info-section">
              <h3>Электронная почта</h3>
              <p>{email}</p>
            </div>

            <div className="settings">
              <h3>Настройки</h3>
              <ul>
                <li>Конфиденциальность</li>
                <li>Уведомления и звуки</li>
                <div className="edit-password" onClick={openPasswordModal}>
                  <li>Пароль</li>
                  <FaPen />
                </div>
                {isPasswordModalOpen && (
                  <div className="password-modal">
                    <div className="password-modal-content">
                      <h2>Изменение пароля</h2>
                      <div className="password-input-container">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Введите текущий пароль"
                        />
                        <div
                          className="eye-icon"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </div>
                      </div>

                      {/* Поле для нового пароля */}
                      <div className="password-input-container">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Введите новый пароль"
                        />
                        <div
                          className="eye-icon"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </div>
                      </div>
                      <div className="password-modal-buttons">
                        <button onClick={handleChangePassword}>Изменить</button>
                        <button onClick={() => setIsPasswordModalOpen(false)}>Отмена</button>
                      </div>
                    </div>
                  </div>
                )}
                <li>Язык</li>
              </ul>
            </div>
          </div>

          <button className="signout-btn" onClick={userSignOut}>Выйти из аккаунта</button>

          <button
            className="delete-account-btn"
            onClick={() => {
              if (window.confirm("Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.")) {
                deleteAccount();
              }
            }}
          >
            Удалить аккаунт
          </button>


          {isAvatarModalOpen && (
            <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
              <div className="avatar-overlay">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="full-size-avatar"
                  onClick={() => setIsAvatarModalOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="signed-out-container">
          <div className="signed-out">
            <h2 className="signed-out-h2" data-text="T I K">T I K</h2>
            <p style={{ color: "white", fontSize: "25px" }}>Вы вышли из аккаунта</p>
            <Link className="authoutlink" to="/">Войти в аккаунт</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDetails;