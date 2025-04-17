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





















import { onAuthStateChanged, signOut, getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword, sendEmailVerification, verifyBeforeUpdateEmail } from "firebase/auth";
import { getStorage, ref as storageRef, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getDatabase, ref as databaseRef, onValue, push, update, get, query, orderByChild, equalTo, remove } from "firebase/database";
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState, useRef, useContext } from "react";
import { auth, database, storage } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FaEllipsisV, FaTimes, FaPen, FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaRegAddressBook, FaAt } from "react-icons/fa"; // Иконка карандаша
import imageCompression from 'browser-image-compression';
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../translations';
import useTranslation from '../hooks/useTranslation';
import { applyTheme, themes } from "../theme";
import VoiceAssistant from "./VoiceAssistant";

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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'standard');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFacultyList, setShowFacultyList] = useState(false);
  const [showCourseList, setShowCourseList] = useState(false);
  const [showGroupList, setShowGroupList] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Состояние для спиннера
  const cathedra = ["Системахои Автоматикунонидашудаи Идоракуни", "Шабакахои Алока Ва Системахои Комутатсиони", "Технологияхои Иттилооти Ва Хифзи Маълумот", "Автоматонии Равандхои Технологи Ва Истехсолот", "Информатика Ва Техникаи Хисоббарор"];
  const courses = ["1", "2", "3", "4"];
  const groups = ["1-530102 - АСКИ", "1-400101 - ТБТИ", "1-450103-02 - ШАваТИ", "1-400102-04 - ТИваХМ", "1-98010101-03 - ТИваХМ", "1-98010101-05 - ТИваХМ", "1-530101 - АРТваИ", "1-530107 - АРТваИ", "1-400301-02 - АРТваИ", "1-400301-05 - АРТваИ", "1-080101-07 - ИваТХ"];

  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslation();
  const { language, handleLanguageChange, showModal, setShowModal } = useContext(LanguageContext);

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

  useEffect(() => {
    const handleVoiceAction = (e) => {
      const action = e.detail;
      if (action === "editUsername") setIsEditingUsername(true);
      if (action === "addPhoto") document.getElementById("avatarInput").click();
      if (action === "changePassword") setIsPasswordModalOpen(true);
      if (action === "themeModal") setShowThemeModal(true);
      if (action === "emailModal") setIsEmailModalOpen(true);
      if (action === "phoneModal") handlePhoneModalOpen();
      if (action === "closeEditUsername") setIsEditingUsername(false);
      if (action === "closePhotoModal") setIsAvatarModalOpen(false);
      if (action === "closePasswordModal") setIsPasswordModalOpen(false);
      if (action === "closeThemeModal") setShowThemeModal(false);
      if (action === "closeEmailModal") setIsEmailModalOpen(false);
      if (action === "closePhoneModal") setIsPhoneModalOpen(false);
    };

    window.addEventListener("voiceAssistantAuthAction", handleVoiceAction);
    return () => window.removeEventListener("voiceAssistantAuthAction", handleVoiceAction);
  }, []);

  useEffect(() => {
    if (authUser) {
      setIsVerified(authUser.emailVerified);
    }
  }, [authUser]);

  const handleSendVerification = () => {
    if (!auth.currentUser) return;

    if (auth.currentUser.emailVerified) {
      showNotification("Вы уже подтверждали свой email.");
      return;
    }

    sendEmailVerification(auth.currentUser)
      .then(() => showNotification("Письмо с подтверждением отправлено на вашу почту."))
      .catch(() => showNotificationError("Ошибка при отправке письма."));
  };

  const handleChangeEmail = async () => {
    if (!authUser) return;

    try {
      const userRef = databaseRef(database, `users/${authUser.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      // 1. Только один раз
      if (userData?.emailChanged) {
        showNotificationError("Вы уже меняли email. Повторная смена запрещена.");
        return;
      }

      const currentPassword = prompt("Введите текущий пароль для подтверждения:");
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 🔁 Используем verifyBeforeUpdateEmail — САМЫЙ ПРАВИЛЬНЫЙ способ
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

      // ⚠ НЕ меняем email в Realtime Database, пока не подтверждён

      setIsEditingEmail(false);
      setIsEmailModalOpen(false);
      showNotification("Письмо для подтверждения нового email отправлено. Подтвердите, чтобы завершить смену.");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        showNotificationError("Неверный пароль.");
      } else {
        showNotificationError("Ошибка при смене email.");
      }
    }
  };

  useEffect(() => {
    const checkEmailUpdate = async () => {
      if (!auth.currentUser) return;

      // Перезагружаем данные пользователя
      await auth.currentUser.reload();

      const userRef = databaseRef(database, `users/${auth.currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      // Если email изменился и еще не был зафиксирован в базе
      if (
        auth.currentUser.email !== userData.email &&
        !userData.emailChanged
      ) {
        await update(userRef, {
          email: auth.currentUser.email,
          emailChanged: true
        });

        setEmail(auth.currentUser.email);
        setIsVerified(auth.currentUser.emailVerified); // обновить статус
        showNotification("Email подтвержден и успешно обновлён.");
      }
    };

    checkEmailUpdate();
  }, []);

  const [identificationStatus, setIdentificationStatus] = useState(t('notident'));
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

  const facultyDropdownRef = useRef(null);
  const courseDropdownRef = useRef(null);
  const groupDropdownRef = useRef(null);

  const handleOpenForm = () => {
    if (identificationStatus === t('notident')) {
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

    if (!fio || !faculty || !course || !group || !photo) {
      showNotificationError("Все поля обязательны к заполнению.");
      return;
    }

    setIsLoading(true); // Включаем спиннер

    try {
      let photoUrl = "";
      if (photo) {
        const storageReference = ref(storage, `request_photos/${Date.now()}_${photo.name}`);
        const snapshot = await uploadBytes(storageReference, photo);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      // Сохранение заявки с дополнительными данными пользователя
      const requestRef = push(databaseRef(database, "requests"));
      await update(requestRef, {
        fio,
        faculty,
        course,
        group,
        photoUrl,
        status: "pending",
        email: authUser.email,
        username,
        userAvatar: avatarUrl,
        userId: authUser.uid
      });

      setRequestId(requestRef.key);
      handleCloseForm();
      showNotification("Заявка отправлена успешно.");
      setIsLoading(false);
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
      if (
        facultyDropdownRef.current && !facultyDropdownRef.current.contains(e.target) &&
        courseDropdownRef.current && !courseDropdownRef.current.contains(e.target) &&
        groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)
      ) {
        setShowFacultyList(false);
        setShowCourseList(false);
        setShowGroupList(false);
      }
    };

    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setEmail(user.email);

        const userRef = databaseRef(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername(data.username || "User");
            setPhoneNumber(data.phoneNumber ? data.phoneNumber : t('addtelnumber'));

            // Проверяем статус преподавателя ДО остальных обновлений
            if (data.role === 'teacher') {
              setIdentificationStatus(t('ident'));
              setStatus(data.status || "online");
              setLastActive(data.lastActive || "");
              setAvatarUrl(data.avatarUrl || "./default-image.png");
              setAboutMe(data.aboutMe || t('infonot'));
              return; // Прерываем выполнение для преподавателей
            }
            // Только для обычных пользователей продолжаем
            setStatus(data.status || "offline");
            setLastActive(data.lastActive || "");
            setAvatarUrl(data.avatarUrl || "./default-image.png");
            setAboutMe(data.aboutMe || t('infonot'));
            setIdentificationStatus(t('notident'));
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
              requestData.status === "accepted" ? t('ident') : t('notident')
            );
          } else {
            setRequestId(null); // No request found
            setIdentificationStatus(t('notident'));
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
        setPhoneNumber("Добавить номер телефона");
        setStatus("offline");
        setLastActive("");
        setAvatarUrl("./default-image.png");
      }
    });

    return () => {
      listen();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [t]);

  const handlePhoneModalOpen = () => {
    setNewPhoneNumber(phoneNumber === t('addtelnumber') ? "+992" : phoneNumber);
    setIsPhoneModalOpen(true);
  };

  // Сохранение номера
  const handleSavePhoneNumber = async () => {
    if (!newPhoneNumber || newPhoneNumber === "+992") {
      setPhoneNumber("Добавить номер телефона"); // Сбрасываем номер
      if (authUser) {
        const userRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userRef, { phoneNumber: null }); // Удаляем номер из базы
      }
    } else {
      setPhoneNumber(newPhoneNumber);
      if (authUser) {
        try {
          const userRef = databaseRef(database, 'users/' + authUser.uid);
          await update(userRef, { phoneNumber: newPhoneNumber }); // Сохраняем новый номер
          showNotification("Номер телефона успешно обновлен.");
        } catch (error) {
          console.error("Ошибка при обновлении номера телефона:", error);
        }
      }
    }
    setIsPhoneModalOpen(false); // Закрываем модальное окно
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
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (authUser && newUsername.trim() !== "" && usernameRegex.test(newUsername)) {
      try {
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        const userSnapshot = await get(userDatabaseRef);
        const userData = userSnapshot.val();

        if (userData?.lastUsernameChange) {
          const lastChangeTimestamp = userData.lastUsernameChange;
          const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastChangeTimestamp < oneWeekInMs) {
            showNotificationError("Вы можете менять имя только раз в неделю.");
            return;
          }
        }

        const usersRef = query(databaseRef(database, 'users'), orderByChild('username'), equalTo(newUsername));
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          showNotificationError("Пользователь с таким именем уже существует, выберите другое имя.");
          return;
        }

        await update(userDatabaseRef, {
          username: newUsername,
          lastUsernameChange: Date.now(),
        });

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
      return <span className="status-online">{t('status')}</span>;
    } else {
      return <span className="status-offline">{t('wasonline')}: {lastActive}</span>;
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

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
    setShowThemeModal(false);
  };

  return (
    <div className="profile-container">
      {notification && (
        <div className={`notification ${notificationType}`}>
          {notification}
        </div>
      )} {/* Уведомление */}
      <div className={`sidebar ${isMenuOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img style={{ width: "50px", height: "45px" }} src={basiclogo} alt="" />
          {isMenuOpen ? (
            <>
              <h2>{t('facultname')}</h2>
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
            {isMenuOpen && <span className="txt">{t('main')}</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/searchpage" className="menu-item">
              <FiSearch className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('findstudents')}</span>}
            </Link>
            <Link to="/teachers" className="menu-item">
              <FiUserCheck className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('teachers')}</span>}
            </Link>
            <Link to="/library" className="menu-item">
              <FiBookOpen className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('library')}</span>}
            </Link>
          </div>
          <Link to="/myprofile" className="menu-item">
            <FiUser className="menu-icon" />
            {isMenuOpen && <span className="txt">{t('profile')}</span>}
          </Link>
          <div className="menu-find-block">
            <Link to="/chats" className="menu-item">
              <FiMessageSquare className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('messages')}</span>}
            </Link>
            <Link to="/notifications" className="menu-item">
              <FiBell className="menu-icon" />
              {isMenuOpen && <span className="txt">{t('notifications')}</span>}
            </Link>
          </div>
          <Link to="/authdetails" className="menu-item">
            <FiSettings className="menu-icon" style={{ background: "linear-gradient(60deg, rgb(219, 98, 98), rgba(0, 128, 107, 0.575), rgba(108, 108, 216, 0.66))", color: "white" }} />
            {isMenuOpen && <span className="txt">{t('settings')}</span>}
          </Link>
        </nav>

        <div className="logo-and-tik">
          {t('facultname')}
          {isMenuOpen &&
            <div>
              <p className="txt">&copy; 2025 {t("rights")}.</p>
            </div>
          }
        </div>
      </div>
      {authUser ? (
        <div className="profile-content">
          <div className="profile-header">

            <Link className="back-button white-icon" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </Link>

            <div className="avatar-section">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
                onClick={() => setIsAvatarModalOpen(true)}
              />
              <label htmlFor="avatarInput" className="avatar-upload-btn">{t('uploadphoto')}</label>
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

            <div className="menu-icon" style={{ marginTop: "5px" }} onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown" ref={menuRef}>
                <button onClick={() => document.getElementById('avatarInput').click()}>{t('addphoto')}</button>
                <button onClick={deleteAvatar}>{t('delphoto')}</button>
                <button onClick={() => setIsEditingUsername(true)}>{t('changeusername')}</button>
              </div>
            )}

          </div>

          {isEditingUsername && (
            <div className="edit-username-section">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                maxLength="12"
                placeholder="Новое имя пользователя"
              />
              <button style={{ height: "35px" }} onClick={handleUsernameChange}>Изменить</button>
              <FaTimes className="close-icon" onClick={() => setIsEditingUsername(false)} /> {/* Кнопка крестика */}
            </div>
          )}

          <div className="profile-info">
            <div className="info-section account" onClick={handlePhoneModalOpen}>
              <div>
                <h3>{t('telnumber')}</h3>
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
                    maxLength={13}
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
                <h3>{t('about')}</h3>
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
                  <h3>{t('identification')}</h3>
                  <p>{identificationStatus}</p>
                </div>
                <div className="ident-block2">
                  <FaLock style={{ color: identificationStatus === t('ident') ? '#0AFFFF' : 'red' }} />
                </div>
              </div>
            </div>

            {isRequestFormOpen && (
              <div className="request-form-modal">
                <div className="form-content">
                  <h2>Идентификация студента</h2>
                  <input type="text" name="fio" placeholder="ФИО" onChange={handleInputChange} required />

                  {/* Факультет */}
                  <div className="custom-dropdown-auth" ref={facultyDropdownRef}>
                    <div
                      className="dropdown-header-auth"
                      onClick={() => {
                        setShowFacultyList(!showFacultyList);
                        setShowCourseList(false);
                        setShowGroupList(false);
                      }}
                    >
                      {studentInfo.faculty || "Выберите кафедру"}
                      <span className={`arrow-auth ${showFacultyList ? "up-auth" : "down-auth"}`}></span>
                    </div>
                    {showFacultyList && (
                      <div className="dropdown-list-auth">
                        {cathedra.map((faculty) => (
                          <div
                            key={faculty}
                            className="dropdown-item-auth"
                            onClick={() => {
                              setStudentInfo(prev => ({ ...prev, faculty }));
                              setShowFacultyList(false);
                            }}
                          >
                            {faculty}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Курс */}
                  <div className="custom-dropdown-auth" ref={courseDropdownRef}>
                    <div
                      className="dropdown-header-auth"
                      onClick={() => {
                        setShowCourseList(!showCourseList);
                        setShowFacultyList(false);
                        setShowGroupList(false);
                      }}
                    >
                      {studentInfo.course || "Выберите курс"}
                      <span className={`arrow-auth ${showCourseList ? "up-auth" : "down-auth"}`}></span>
                    </div>
                    {showCourseList && (
                      <div className="dropdown-list-auth">
                        {courses.map((course) => (
                          <div
                            key={course}
                            className="dropdown-item-auth"
                            onClick={() => {
                              setStudentInfo(prev => ({ ...prev, course }));
                              setShowCourseList(false);
                            }}
                          >
                            {course}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Группа */}
                  <div className="custom-dropdown-auth" ref={groupDropdownRef}>
                    <div
                      className="dropdown-header-auth"
                      onClick={() => {
                        setShowGroupList(!showGroupList);
                        setShowFacultyList(false);
                        setShowCourseList(false);
                      }}
                    >
                      {studentInfo.group || "Выберите группу"}
                      <span className={`arrow-auth ${showGroupList ? "up-auth" : "down-auth"}`}></span>
                    </div>
                    {showGroupList && (
                      <div className="dropdown-list-auth">
                        {groups.map((group) => (
                          <div
                            key={group}
                            className="dropdown-item-auth"
                            onClick={() => {
                              setStudentInfo(prev => ({ ...prev, group }));
                              setShowGroupList(false);
                            }}
                          >
                            {group}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <label style={{ color: "grey", fontSize: "14px" }}>Фото студенческого билета</label>
                  <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
                  <button className="sendstudentsrequest-button" onClick={handleSubmitRequest}>
                    {isLoading ? (
                      // Пример простого спиннера через CSS
                      <span className="reg-spinner"></span>
                    ) : (
                      "Отправить"
                    )}
                  </button>
                  <button onClick={handleCloseForm}>Закрыть</button>
                </div>
              </div>
            )}

            <div className="info-section" onClick={() => setIsEmailModalOpen(true)}>
              <div className="basic-email-block">
              <div className="email-block1">
              <h3>{t('email')}</h3>
              <p>{email}</p>
              <p style={{ color: isVerified ? "lightgreen" : "red", fontSize: "14px" }}>
                {isVerified ? t('confirmed') : t('notconfirmed')}
              </p>
              </div>
              <div className="email-block2">
                  <FaAt style={{ color: isVerified ? "#0AFFFF" : "red" }} />
              </div>
              </div>
            </div>

            {isEmailModalOpen && (
              <div className="email-modal-backdrop" onClick={() => setIsEmailModalOpen(false)}>
                <div className="email-modal-window" onClick={(e) => e.stopPropagation()}>
                  {!isEditingEmail ? (
                    <>
                      <h3 style={{ color: "grey" }}>{email}</h3>
                      <button onClick={() => setIsEditingEmail(true)}>Изменить email</button>
                      <button onClick={handleSendVerification}>Подтвердить email</button>
                      <button onClick={() => setIsEmailModalOpen(false)}>Закрыть</button>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Новый email"
                      />
                      <button onClick={handleChangeEmail}>Сохранить</button>
                      <button onClick={() => setIsEditingEmail(false)}>Отмена</button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="settings">
              <h3>{t('settings')}</h3>
              <ul>
                <li onClick={() => setShowThemeModal(true)}>{t('mode')}</li>

                {/* Модальное окно для выбора темы */}
                {showThemeModal && (
                  <div
                    className="modal-backdrop-theme"
                    onClick={() => setShowThemeModal(false)}
                    style={{
                      position: 'fixed',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1000
                    }}
                  >
                    <div
                      className="modal-content-theme"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        minWidth: '250px',
                        textAlign: 'center'
                      }}
                    >
                      <h3 style={{ color: "grey" }}>Выберите тему</h3>
                      <button onClick={() => handleThemeChange('standard')}>Универсальная</button>
                      <button onClick={() => handleThemeChange('light')}>Светлая</button>
                      <button onClick={() => handleThemeChange('dark')}>Темная</button>
                    </div>
                  </div>
                )}

                <div className="edit-password" onClick={openPasswordModal}>
                  <li>{t('password')}</li>
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
                <li onClick={() => setShowModal(true)}>
                  {translations[language].language}
                </li>
                {showModal && (
                  <div
                    className="modal-backdrop-lang"
                    onClick={() => setShowModal(false)}
                  >
                    <div
                      className="modal-content-lang"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button onClick={() => handleLanguageChange('tajik')}>Тоҷикӣ</button>
                      <div style={{ borderBottom: "1px solid grey", width: "25px" }}>
                      </div>
                      <button onClick={() => handleLanguageChange('russian')}>Русский</button>
                      <div style={{ borderBottom: "1px solid grey", width: "25px" }}>
                      </div>
                      <button onClick={() => handleLanguageChange('english')}>English</button>
                      <div style={{ borderBottom: "1px solid grey", width: "25px" }}>
                      </div>
                    </div>
                  </div>
                )}
              </ul>
            </div>
          </div>

          <button className="signout-btn" onClick={userSignOut}>{t('logout')}</button>

          <button
            className="delete-account-btn"
            onClick={() => {
              if (window.confirm("Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.")) {
                deleteAccount();
              }
            }}
          >
            {t('delaccount')}
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












// import { onAuthStateChanged, signOut, getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
// import { getStorage, ref as storageRef, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import { getDatabase, ref as databaseRef, onValue, push, update, get, query, orderByChild, equalTo, remove } from "firebase/database";
// import React, { useEffect, useState, useRef } from "react";
// import { auth, database, storage } from "../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import { FaEllipsisV, FaTimes, FaPen, FaArrowLeft } from "react-icons/fa"; // Иконка карандаша
// import imageCompression from 'browser-image-compression';
// import useTranslation from '../hooks/useTranslation';

// const AuthDetails = () => {
//   const [authUser, setAuthUser] = useState(null);
//   const [username, setUsername] = useState("");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [showMenu, setShowMenu] = useState(false);
//   const [newUsername, setNewUsername] = useState("");
//   const [isEditingUsername, setIsEditingUsername] = useState(false);
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const [notification, setNotification] = useState(""); // Для уведомления
//   const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
//   const menuRef = useRef(null);

//   const cathedra = ["Системахои Автоматикунонидашудаи Идоракуни", "Шабакахои Алока Ва Системахои Комутатсиони", "Технологияхои Иттилооти Ва Хифзи Маълумот", "Автоматонии Равандхои Технологи Ва Истехсолот", "Информатика Ва Техникаи Хисоббарор"];
//   const courses = ["1", "2", "3", "4"];
//   const groups = ["1-530102 - АСКИ", "1-400101 - ТБТИ", "1-450103-02 - ШАваТИ", "1-400102-04 - ТИваХМ", "1-98010101-03 - ТИваХМ", "1-98010101-05 - ТИваХМ", "1-530101 - АРТваИ", "1-530107 - АРТваИ", "1-400301-02 - АРТваИ", "1-400301-05 - АРТваИ", "1-080101-07 - ИваТХ"];
//   const t = useTranslation();
//   const navigate = useNavigate();

//   const [identificationStatus, setIdentificationStatus] = useState(t('notident'));
//   const [requestId, setRequestId] = useState(null); // New state for tracking request ID
//   const user = auth.currentUser;

//   // Состояние для формы заявки
//   const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
//   const [studentInfo, setStudentInfo] = useState({
//     fio: "",
//     faculty: "",
//     course: "",
//     group: "",
//     photo: null,
//   });

//   const facultyDropdownRef = useRef(null);
//   const courseDropdownRef = useRef(null);
//   const groupDropdownRef = useRef(null);

//   const handleOpenForm = () => {
//     if (identificationStatus === t('notident')) {
//       setIsRequestFormOpen(true);
//     } else {
//       showNotification("Вы уже идентифицированы.");
//     }
//   };
//   const handleCloseForm = () => setIsRequestFormOpen(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setStudentInfo((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     setStudentInfo((prev) => ({ ...prev, photo: e.target.files[0] }));
//   };

//   const handleSubmitRequest = async () => {
//     const { fio, faculty, course, group, photo } = studentInfo;

//     if (!fio || !faculty || !course || !group || !photo) {
//       showNotificationError("Все поля обязательны к заполнению.");
//       return;
//     }

//     try {
//       let photoUrl = "";
//       if (photo) {
//         const storageReference = ref(storage, `request_photos/${Date.now()}_${photo.name}`);
//         const snapshot = await uploadBytes(storageReference, photo);
//         photoUrl = await getDownloadURL(snapshot.ref);
//       }

//       // Сохранение заявки с дополнительными данными пользователя
//       const requestRef = push(databaseRef(database, "requests"));
//       await update(requestRef, {
//         fio,
//         faculty,
//         course,
//         group,
//         photoUrl,
//         status: "pending",
//         email: authUser.email,          // Email пользователя
//         username,                      // Имя пользователя (из состояния компонента)
//         userAvatar: avatarUrl,         // URL аватарки пользователя
//         userId: authUser.uid           // uid пользователя, чтобы можно было перейти в его профиль
//       });

//       setRequestId(requestRef.key);
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
//       if (
//         facultyDropdownRef.current && !facultyDropdownRef.current.contains(e.target) &&
//         courseDropdownRef.current && !courseDropdownRef.current.contains(e.target) &&
//         groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)
//       ) {
//         setShowFacultyList(false);
//         setShowCourseList(false);
//         setShowGroupList(false);
//       }
//     };

//     const listen = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthUser(user);
//         setEmail(user.email);

//         const userRef = databaseRef(database, 'users/' + user.uid);
//         onValue(userRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             setUsername(data.username || "User");
//             setPhoneNumber(data.phoneNumber ? data.phoneNumber : t('addtelnumber'));

//             // Проверяем статус преподавателя ДО остальных обновлений
//             if (data.role === 'teacher') {
//               setIdentificationStatus(t('ident'));
//               setStatus(data.status || "online");
//               setLastActive(data.lastActive || "");
//               setAvatarUrl(data.avatarUrl || "./default-image.png");
//               setAboutMe(data.aboutMe || t('infonot'));
//               return; // Прерываем выполнение для преподавателей
//             }
//             // Только для обычных пользователей продолжаем
//             setStatus(data.status || "offline");
//             setLastActive(data.lastActive || "");
//             setAvatarUrl(data.avatarUrl || "./default-image.png");
//             setAboutMe(data.aboutMe || t('infonot'));
//             setIdentificationStatus(t('notident'));
//           }
//         });


//         // Подписка на изменения статуса заявки пользователя
//         const requestRef = query(
//           databaseRef(database, "requests"),
//           orderByChild("email"),
//           equalTo(user.email)
//         );
//         onValue(requestRef, (snapshot) => {
//           if (snapshot.exists()) {
//             const requestData = Object.values(snapshot.val())[0];
//             setRequestId(requestData.id); // Get request ID
//             setIdentificationStatus(
//               requestData.status === "accepted" ? t('ident') : t('notident')
//             );
//           } else {
//             setRequestId(null); // No request found
//             setIdentificationStatus(t('notident'));
//           }
//         });

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
//         setPhoneNumber("Добавить номер телефона");
//         setStatus("offline");
//         setLastActive("");
//         setAvatarUrl("./default-image.png");
//       }
//     });

//     return () => {
//       listen();
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [t]);

//   // Функция для успешных уведомлений
//   const showNotification = (message) => {
//     setNotificationType("success");
//     setNotification(message);
//     setTimeout(() => {
//       setNotification("");
//       setNotificationType("");
//     }, 3000);
//   };

//   // Функция для ошибочных уведомлений
//   const showNotificationError = (message) => {
//     setNotificationType("error");
//     setNotification(message);
//     setTimeout(() => {
//       setNotification("");
//       setNotificationType("");
//     }, 3000);
//   };

//   const handleAvatarChange = async (e) => {
//     const file = e.target.files[0];
//     if (file && authUser) {
//       try {
//         // Опции для сжатия изображения
//         const options = {
//           maxSizeMB: 1, // Максимальный размер файла 1 МБ
//           maxWidthOrHeight: 800, // Максимальная ширина или высота изображения
//           useWebWorker: true,
//         };

//         // Сжимаем изображение
//         const compressedFile = await imageCompression(file, options);

//         // Загружаем сжатое изображение в Firebase
//         const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
//         const snapshot = await uploadBytes(avatarStorageRef, compressedFile);
//         const downloadURL = await getDownloadURL(avatarStorageRef);

//         // Обновляем аватар пользователя
//         setAvatarUrl(downloadURL);
//         const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//         await update(userDatabaseRef, { avatarUrl: downloadURL });

//         setShowMenu(false);
//         showNotification("Фото профиля успешно обновлено.");
//       } catch (error) {
//         console.error("Ошибка при загрузке изображения:", error);
//         showNotificationError("Ошибка при загрузке фото.");
//       }
//     }
//   };

//   const deleteAvatar = async () => {
//     if (authUser) {
//       try {
//         const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
//         await deleteObject(avatarStorageRef);
//         const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//         await update(userDatabaseRef, { avatarUrl: "./default-image.png" });
//         setAvatarUrl("./default-image.png");
//         setShowMenu(false);
//       } catch (error) {
//         console.error("Ошибка при удалении изображения:", error);
//       }
//     }
//   };

//   const handleUsernameChange = async () => {
//     const usernameRegex = /^[a-zA-Z0-9._]+$/;
//     if (authUser && newUsername.trim() !== "" && usernameRegex.test(newUsername)) {
//       try {
//         const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//         const userSnapshot = await get(userDatabaseRef);
//         const userData = userSnapshot.val();

//         if (userData?.lastUsernameChange) {
//           const lastChangeTimestamp = userData.lastUsernameChange;
//           const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
//           if (Date.now() - lastChangeTimestamp < oneWeekInMs) {
//             showNotificationError("Вы можете менять имя только раз в неделю.");
//             return;
//           }
//         }

//         const usersRef = query(databaseRef(database, 'users'), orderByChild('username'), equalTo(newUsername));
//         const snapshot = await get(usersRef);
//         if (snapshot.exists()) {
//           showNotificationError("Пользователь с таким именем уже существует, выберите другое имя.");
//           return;
//         }

//         await update(userDatabaseRef, {
//           username: newUsername,
//           lastUsernameChange: Date.now(),
//         });

//         setUsername(newUsername);
//         setIsEditingUsername(false);
//         showNotification(`Имя изменено на "${newUsername}"`);
//       } catch (error) {
//         console.error("Ошибка при изменении имени пользователя:", error);
//       }
//     } else {
//       showNotificationError("Имя пользователя может содержать только буквы, цифры, нижнее подчеркивание и точку.");
//     }
//   };

//   const userSignOut = () => {
//     const userRef = databaseRef(database, 'users/' + authUser.uid);
//     update(userRef, {
//       status: "offline",
//       lastActive: new Date().toLocaleString()
//     }).then(() => {
//       signOut(auth).then(() => console.log("Successfully signed out!")).catch((e) => console.log(e));
//     });
//   };

//   const deleteAccount = async () => {
//     if (!authUser) return;

//     const userId = authUser.uid; // Сохраняем UID для дальнейшего использования
//     const userRef = databaseRef(database, 'users/' + userId);
//     const avatarRef = storageRef(storage, `avatars/${userId}`);

//     try {
//       // Сначала выйти из аккаунта
//       await signOut(auth);
//       showNotification("Вы вышли из аккаунта.");

//       // Удалить аватар из Firebase Storage
//       await deleteObject(avatarRef).catch((error) => {
//         console.warn("Ошибка удаления аватара:", error);
//       });

//       // Удалить данные из Realtime Database
//       await remove(userRef).catch((error) => {
//         console.error("Ошибка удаления данных из базы данных:", error);
//       });

//       showNotification("Аккаунт успешно удалён.");
//       navigate("/"); // Перенаправить на главную страницу
//     } catch (error) {
//       console.error("Ошибка при удалении аккаунта:", error);
//       showNotificationError("Не удалось удалить аккаунт. Пожалуйста, попробуйте снова.");
//     }
//   };


//   const renderStatus = () => {
//     if (status === "online") {
//       return <span className="status-online">{t('status')}</span>;
//     } else {
//       return <span className="status-offline">{t('wasonline')}: {lastActive}</span>;
//     }
//   };

//   return (
//     <div className="profile-container">
//       {notification && (
//         <div className={`notification ${notificationType}`}>
//           {notification}
//         </div>
//       )} {/* Уведомление */}
//       {authUser ? (
//         <div className="profile-content">
//           <div className="profile-header">

//             <Link className="back-button white-icon" onClick={() => navigate(-1)}>
//               <FaArrowLeft />
//             </Link>

//             <div className="avatar-section">
//               <img
//                 src={avatarUrl}
//                 alt="Avatar"
//                 className="avatar"
//                 onClick={() => setIsAvatarModalOpen(true)}
//               />
//               <label htmlFor="avatarInput" className="avatar-upload-btn">{t('uploadphoto')}</label>
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
//               <p style={{ color: "lightgreen" }}>{renderStatus()}</p>
//             </div>

//             <div className="menu-icon" style={{ marginTop: "5px" }} onClick={() => setShowMenu(!showMenu)}>
//               <FaEllipsisV />
//             </div>

//             {showMenu && (
//               <div className="menu-dropdown" ref={menuRef}>
//                 <button onClick={() => document.getElementById('avatarInput').click()}>{t('addphoto')}</button>
//                 <button onClick={deleteAvatar}>{t('delphoto')}</button>
//                 <button onClick={() => setIsEditingUsername(true)}>{t('changeusername')}</button>
//               </div>
//             )}

//           </div>

//           {isEditingUsername && (
//             <div className="edit-username-section">
//               <input
//                 type="text"
//                 value={newUsername}
//                 onChange={(e) => setNewUsername(e.target.value)}
//                 maxLength="12"
//                 placeholder="Новое имя пользователя"
//               />
//               <button style={{ height: "35px" }} onClick={handleUsernameChange}>Изменить</button>
//               <FaTimes className="close-icon" onClick={() => setIsEditingUsername(false)} /> {/* Кнопка крестика */}
//             </div>
//           )}

//           <button className="signout-btn" onClick={userSignOut}>{t('logout')}</button>

//           <button
//             className="delete-account-btn"
//             onClick={() => {
//               if (window.confirm("Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.")) {
//                 deleteAccount();
//               }
//             }}
//           >
//             {t('delaccount')}
//           </button>


//           {isAvatarModalOpen && (
//             <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//               <div className="avatar-overlay">
//                 <img
//                   src={avatarUrl}
//                   alt="Avatar"
//                   className="full-size-avatar"
//                   onClick={() => setIsAvatarModalOpen(false)}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="signed-out-container">
//           <div className="signed-out">
//             <h2 className="signed-out-h2" data-text="T I K">T I K</h2>
//             <p style={{ color: "white", fontSize: "25px" }}>Вы вышли из аккаунта</p>
//             <Link className="authoutlink" to="/">Войти в аккаунт</Link>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuthDetails;