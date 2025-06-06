// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { auth } from "../firebase";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   get,
//   set,
//   push,
//   query, orderByChild, equalTo
// } from "firebase/database";
// import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import "../UserProfile.css";
// import { motion } from 'framer-motion';
// import useTranslation from '../hooks/useTranslation';

// const UserProfile = () => {
//   const { userId } = useParams();
//   const [userData, setUserData] = useState(null);
//   const t = useTranslation();
//   const [identificationStatus, setIdentificationStatus] = useState(t('notident'));
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const navigate = useNavigate();
//   const [requestStatus, setRequestStatus] = useState("none");

//   useEffect(() => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     if (!currentUserId || !userId) return;

//     // Проверяем существующие запросы между пользователями
//     const pairId = [currentUserId, userId].sort().join("_");
//     const requestsRef = databaseRef(db, "requests");
//     const pairQuery = query(requestsRef, orderByChild("pairId"), equalTo(pairId));

//     const unsubscribe = onValue(pairQuery, (snapshot) => {
//       if (snapshot.exists()) {
//         const requests = Object.values(snapshot.val());
//         const acceptedRequest = requests.find((req) => req.status === "accepted");
//         const pendingRequest = requests.find((req) => req.status === "pending");

//         if (acceptedRequest) {
//           setRequestStatus("accepted");
//         } else if (pendingRequest) {
//           setRequestStatus(pendingRequest.senderId === currentUserId ? "pending" : "none");
//         } else {
//           setRequestStatus("none");
//         }
//       } else {
//         setRequestStatus("none");
//       }
//     });

//     return () => unsubscribe();
//   }, [userId]);

//   const handleSendRequest = async () => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     if (!currentUserId || !userId) return;

//     // Получаем данные текущего пользователя
//     const currentUserSnapshot = await get(databaseRef(db, `users/${currentUserId}`));
//     const currentUserData = currentUserSnapshot.val();

//     // Создаем запрос
//     const requestData = {
//       senderId: currentUserId,
//       receiverId: userId,
//       status: "pending",
//       pairId: [currentUserId, userId].sort().join("_"),
//       timestamp: new Date().toISOString(),
//     };

//     // Сохраняем запрос
//     await set(databaseRef(db, `requests/${currentUserId}_${userId}`), requestData);

//     // Создаем уведомление
//     const notificationData = {
//       type: "conversation_request",
//       senderId: currentUserId,
//       senderName: currentUserData.username,
//       senderAvatar: currentUserData.avatarUrl || "./default-image.png",
//       timestamp: new Date().toISOString(),
//     };

//     const notificationsRef = databaseRef(db, `notifications/${userId}`);
//     await push(notificationsRef, notificationData);

//     setRequestStatus("pending");
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const userRef = databaseRef(db, `users/${userId}`);

//     onValue(userRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setUserData(data);
//         setStatus(data.status || "offline");
//         setLastActive(data.lastActive || "");
//         setAvatarUrl(data.avatarUrl || "./default-image.png");

//         // ПЕРЕНЕСИТЕ ЭТОТ КОД СЮДА
//         const requestRef = query(
//           databaseRef(db, "requests"),
//           orderByChild("email"),
//           equalTo(data.email || "") // Используем email из полученных данных
//         );

//         onValue(requestRef, (requestSnapshot) => {
//           if (requestSnapshot.exists()) {
//             const requestData = Object.values(requestSnapshot.val())[0];
//             setIdentificationStatus(
//               requestData.status === "accepted" ? t('ident') : t('notident')
//             );
//           } else {
//             setIdentificationStatus(t('notident'));
//           }
//         });
//       }
//     });
//   }, [userId, t]);

//   const renderStatus = () => {
//     return status === "online" ? (
//       <span className="up-status-online">в сети</span>
//     ) : (
//       <span className="up-status-offline">был(а) в сети: {lastActive}</span>
//     );
//   };

//   const handleCreateChat = () => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     const chatRoomId = generateUniqueChatId(currentUserId, userId); // userId — ID собеседника

//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
//     const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
//     const recipientChatRef = databaseRef(db, `users/${userId}/chats/${chatRoomId}`);

//     get(databaseRef(db, `users/${currentUserId}`)).then((snapshot) => {
//       const currentUserData = snapshot.val();

//       if (!currentUserData) {
//         console.error("Не удалось загрузить данные текущего пользователя");
//         return;
//       }

//       get(chatRoomRef).then((snapshot) => {
//         if (snapshot.exists()) {
//           // Если чат уже существует, просто переходим в него
//           navigate(`/chat/${chatRoomId}`);
//         } else {
//           // Создаем новый чат
//           const chatRoomData = {
//             participants: {
//               [currentUserId]: true,
//               [userId]: true,
//             },
//             createdAt: new Date().toISOString(),
//           };

//           const currentUserChatData = {
//             chatRoomId,
//             recipientId: userId,
//             recipientName: userData.username, // Имя получателя
//             recipientAvatar: userData.avatarUrl || "./default-image.png",
//             lastMessage: "",
//             timestamp: new Date().toISOString(),
//           };

//           const recipientChatData = {
//             chatRoomId,
//             recipientId: currentUserId,
//             recipientName: currentUserData.username, // Имя текущего пользователя
//             recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
//             lastMessage: "",
//             timestamp: new Date().toISOString(),
//           };

//           Promise.all([
//             set(chatRoomRef, chatRoomData),
//             set(currentUserChatRef, currentUserChatData),
//             set(recipientChatRef, recipientChatData),
//           ])
//             .then(() => navigate(`/chat/${chatRoomId}`))
//             .catch((error) => console.error("Ошибка при создании чата:", error));
//         }
//       });
//     });
//   };

//   // Генерация уникального ID чата
//   const generateUniqueChatId = (id1, id2) => {
//     const sortedIds = [id1, id2].sort(); // Сортировка ID для уникальности
//     return `${sortedIds[0]}_${sortedIds[1]}`;
//   };  

//   if (!userData) {
//     return  <div className="loading-container">
//     <motion.div
//       className="spinner"
//       animate={{ rotate: 360 }}
//       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//     />
//     <motion.p
//       className="loading-text"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: [0, 1, 0] }}
//       transition={{ duration: 2, repeat: Infinity }}
//     >
//       Идём к пользователю...
//     </motion.p>
//     <style jsx>{`
//       .loading-container {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//         height: 100vh;
//         background: radial-gradient(circle, #1a1a2e, #16213e);
//         color: white;
//         font-family: Arial, sans-serif;
//       }
//       .spinner {
//         width: 60px;
//         height: 60px;
//         border: 6px solid rgba(255, 255, 255, 0.3);
//         border-top-color: #00d4ff;
//         border-radius: 50%;
//         margin-bottom: 20px;
//       }
//       .loading-text {
//         font-size: 18px;
//         font-weight: bold;
//         letter-spacing: 1.5px;
//       }
//     `}</style>
//   </div>;
//   }

//   return (
//     <div className="up-profile-container">
//       <div className="up-profile-header">
//         <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
//           <img
//             src={userData.avatarUrl || "./default-image.png"}
//             alt={userData.username}
//             className="up-user-avatar skeleton-media-avatars"
//             onClick={() => setIsAvatarModalOpen(true)}
//           />
//           <div>
//             <h2 className="username">{userData.username}</h2>
//             {renderStatus()}
//           </div>
//         </div>
//         <FaEllipsisV className="up-menu-icon" />
//       </div>

//       {isAvatarModalOpen && (
//         <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//           <div className="avatar-overlay">
//             <img
//               src={avatarUrl}
//               alt="Avatar"
//               className="full-size-avatar"
//               onClick={() => setIsAvatarModalOpen(false)}
//             />
//           </div>
//         </div>
//       )}

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaPhone className="up-info-icon" />
//           Номер телефона
//         </div>
//         <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaUserEdit className="up-info-icon" />
//           О себе
//         </div>
//         <div className="info-content">{userData.aboutMe || "Нет информации"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaLock
//             className={`up-info-icon ${
//               identificationStatus === t('ident') ? "up-icon-verified" : "up-icon-unverified"
//             }`}
//           />
//           Идентификация
//         </div>
//         <div
//           className={`up-info-content ${
//             identificationStatus === t('ident') ? "up-status-verified" : "up-status-unverified"
//           }`}
//         >
//           {identificationStatus}
//         </div>
//       </div>

//       {requestStatus === "accepted" ? (
//         <button className="up-chat-button" onClick={handleCreateChat}>
//           Написать
//         </button>
//       ) : requestStatus === "pending" ? (
//         <button className="up-chat-button" disabled>
//           Запрос отправлен
//         </button>
//       ) : (
//         <button className="up-chat-button" onClick={handleSendRequest}>
//           Отправить запрос на переписку
//         </button>
//       )}

//     </div>
//   );
// };

// export default UserProfile;










// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { auth } from "../firebase";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   get,
//   set,
//   push,
//   query, orderByChild, equalTo
// } from "firebase/database";
// import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import "../UserProfile.css";
// import { motion } from 'framer-motion';
// import useTranslation from '../hooks/useTranslation';

// const UserProfile = () => {
//   const { userId } = useParams();
//   const [userData, setUserData] = useState(null);
//   const t = useTranslation();
//   const [identificationStatus, setIdentificationStatus] = useState(t('notident'));
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
//   const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
//   const navigate = useNavigate();
//   const [requestStatus, setRequestStatus] = useState("none");

//   useEffect(() => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     if (!currentUserId || !userId) return;

//     const pairId = [currentUserId, userId].sort().join("_");
//     const requestsRef = databaseRef(db, "requests");
//     const pairQuery = query(requestsRef, orderByChild("pairId"), equalTo(pairId));

//     const unsubscribe = onValue(pairQuery, (snapshot) => {
//       if (snapshot.exists()) {
//         const requests = Object.values(snapshot.val());
//         const acceptedRequest = requests.find((req) => req.status === "accepted");
//         const pendingRequest = requests.find((req) => req.status === "pending");

//         setRequestStatus(
//           acceptedRequest ? "accepted" :
//           pendingRequest?.senderId === currentUserId ? "pending" : "none"
//         );
//       } else {
//         setRequestStatus("none");
//       }
//     });

//     return () => unsubscribe();
//   }, [userId, auth.currentUser?.uid]);  // ✅ Теперь подписка обновляется при смене пользователя  

//   const handleSendRequest = async () => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     if (!currentUserId || !userId) return;

//     // Получаем данные текущего пользователя
//     const currentUserSnapshot = await get(databaseRef(db, `users/${currentUserId}`));
//     const currentUserData = currentUserSnapshot.val();

//     // Создаем запрос
//     const requestData = {
//       senderId: currentUserId,
//       receiverId: userId,
//       status: "pending",
//       pairId: [currentUserId, userId].sort().join("_"),
//       timestamp: new Date().toISOString(),
//     };

//     // Сохраняем запрос
//     await set(databaseRef(db, `requests/${currentUserId}_${userId}`), requestData);

//     // Создаем уведомление
//     const notificationData = {
//       type: "conversation_request",
//       senderId: currentUserId,
//       senderName: currentUserData.username,
//       senderAvatar: currentUserData.avatarUrl || "./default-image.png",
//       timestamp: new Date().toISOString(),
//     };

//     const notificationsRef = databaseRef(db, `notifications/${userId}`);
//     await push(notificationsRef, notificationData);

//     setRequestStatus("pending");
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const userRef = databaseRef(db, `users/${userId}`);

//     const unsubscribeUser = onValue(userRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setUserData(data);
//         setStatus(data.status || "offline");
//         setLastActive(data.lastActive || "");
//         setAvatarUrl(data.avatarUrl || "./default-image.png");
//       }
//     });

//     return () => unsubscribeUser();
//   }, [userId]);

//   useEffect(() => {
//     if (!userData?.email) return;

//     const db = getDatabase();
//     const requestRef = query(databaseRef(db, "requests"), orderByChild("email"), equalTo(userData.email));

//     const unsubscribeRequest = onValue(requestRef, (requestSnapshot) => {
//       if (requestSnapshot.exists()) {
//         const requestData = Object.values(requestSnapshot.val())[0];
//         setIdentificationStatus(requestData.status === "accepted" ? t('ident') : t('notident'));
//       } else {
//         setIdentificationStatus(t('notident'));
//       }
//     });

//     return () => unsubscribeRequest();
//   }, [userData?.email, t]);  // Теперь подписка обновляется только если email изменился  

//   const renderStatus = () => {
//     return status === "online" ? (
//       <span className="up-status-online">в сети</span>
//     ) : (
//       <span className="up-status-offline">был(а) в сети: {lastActive}</span>
//     );
//   };

//   const handleCreateChat = async () => {
//     const db = getDatabase();
//     const currentUserId = auth.currentUser?.uid;
//     if (!currentUserId || !userId) return;

//     const chatRoomId = generateUniqueChatId(currentUserId, userId);
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

//     try {
//       const chatSnapshot = await get(chatRoomRef);
//       if (chatSnapshot.exists()) {
//         navigate(`/chat/${chatRoomId}`);
//         return;
//       }

//       const currentUserSnapshot = await get(databaseRef(db, `users/${currentUserId}`));
//       const currentUserData = currentUserSnapshot.val();
//       if (!currentUserData) {
//         console.error("Не удалось загрузить данные текущего пользователя");
//         return;
//       }

//       const chatRoomData = {
//         participants: { [currentUserId]: true, [userId]: true },
//         createdAt: new Date().toISOString(),
//       };

//       const currentUserChatData = {
//         chatRoomId,
//         recipientId: userId,
//         recipientName: userData.username,
//         recipientAvatar: userData.avatarUrl || "./default-image.png",
//         lastMessage: "",
//         timestamp: new Date().toISOString(),
//       };

//       const recipientChatData = {
//         chatRoomId,
//         recipientId: currentUserId,
//         recipientName: currentUserData.username,
//         recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
//         lastMessage: "",
//         timestamp: new Date().toISOString(),
//       };

//       await Promise.all([
//         set(chatRoomRef, chatRoomData),
//         set(databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`), currentUserChatData),
//         set(databaseRef(db, `users/${userId}/chats/${chatRoomId}`), recipientChatData),
//       ]);

//       navigate(`/chat/${chatRoomId}`);
//     } catch (error) {
//       console.error("Ошибка при создании чата:", error);
//     }
//   };  

//   // Генерация уникального ID чата
//   const generateUniqueChatId = (id1, id2) => {
//     const sortedIds = [id1, id2].sort(); // Сортировка ID для уникальности
//     return `${sortedIds[0]}_${sortedIds[1]}`;
//   };  

//   if (!userData) {
//     return  <div className="loading-container">
//     <motion.div
//       className="spinner"
//       animate={{ rotate: 360 }}
//       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//     />
//     <motion.p
//       className="loading-text"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: [0, 1, 0] }}
//       transition={{ duration: 2, repeat: Infinity }}
//     >
//       Идём к пользователю...
//     </motion.p>
//     <style jsx>{`
//       .loading-container {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//         height: 100vh;
//         background: radial-gradient(circle, #1a1a2e, #16213e);
//         color: white;
//         font-family: Arial, sans-serif;
//       }
//       .spinner {
//         width: 60px;
//         height: 60px;
//         border: 6px solid rgba(255, 255, 255, 0.3);
//         border-top-color: #00d4ff;
//         border-radius: 50%;
//         margin-bottom: 20px;
//       }
//       .loading-text {
//         font-size: 18px;
//         font-weight: bold;
//         letter-spacing: 1.5px;
//       }
//     `}</style>
//   </div>;
//   }

//   return (
//     <div className="up-profile-container">
//       <div className="up-profile-header">
//         <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
//           <img
//             src={userData.avatarUrl || "./default-image.png"}
//             alt={userData.username}
//             className="up-user-avatar skeleton-media-avatars"
//             onClick={() => setIsAvatarModalOpen(true)}
//           />
//           <div>
//             <h2 className="username">{userData.username}</h2>
//             {renderStatus()}
//           </div>
//         </div>
//         <FaEllipsisV className="up-menu-icon" />
//       </div>

//       {isAvatarModalOpen && (
//         <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
//           <div className="avatar-overlay">
//             <img
//               src={avatarUrl}
//               alt="Avatar"
//               className="full-size-avatar"
//               onClick={() => setIsAvatarModalOpen(false)}
//             />
//           </div>
//         </div>
//       )}

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaPhone className="up-info-icon" />
//           Номер телефона
//         </div>
//         <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaUserEdit className="up-info-icon" />
//           О себе
//         </div>
//         <div className="info-content">{userData.aboutMe || "Нет информации"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaLock
//             className={`up-info-icon ${
//               identificationStatus === t('ident') ? "up-icon-verified" : "up-icon-unverified"
//             }`}
//           />
//           Идентификация
//         </div>
//         <div
//           className={`up-info-content ${
//             identificationStatus === t('ident') ? "up-status-verified" : "up-status-unverified"
//           }`}
//         >
//           {identificationStatus}
//         </div>
//       </div>

//       {requestStatus === "accepted" ? (
//         <button className="up-chat-button" onClick={handleCreateChat}>
//           Написать
//         </button>
//       ) : requestStatus === "pending" ? (
//         <button className="up-chat-button" disabled>
//           Запрос отправлен
//         </button>
//       ) : (
//         <button className="up-chat-button" onClick={handleSendRequest}>
//           Отправить запрос на переписку
//         </button>
//       )}

//     </div>
//   );
// };

// export default UserProfile;





import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  get,
  set,
  push,
  query, orderByChild, equalTo
} from "firebase/database";
import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV, FaScroll, FaUserGraduate, FaUsers, FaBook } from "react-icons/fa";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import "../UserProfile.css";
import { motion } from 'framer-motion';
import basiclogo from "../basic-logo.png";
import useTranslation from '../hooks/useTranslation';

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const t = useTranslation();
  const [identificationStatus, setIdentificationStatus] = useState(t('notident'));
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState("none");
  const database = getDatabase();
  const [userRole, setUserRole] = useState('');
  const [role, setRole] = useState("");
  const [teacherTitle, setTeacherTitle] = useState("");
  const [teacherCathedra, setTeacherCathedra] = useState("");
  const [TeacherSubject, setTeacherSubject] = useState("");
  const [userFaculty, setUserFaculty] = useState("не известно");
  const [userCourse, setUserCourse] = useState("не известно");
  const [userGroup, setUserGroup] = useState("не известно");

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


  useEffect(() => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !userId) return;

    const pairId = [currentUserId, userId].sort().join("_");
    const requestsRef = databaseRef(db, "requests");
    const pairQuery = query(requestsRef, orderByChild("pairId"), equalTo(pairId));

    const unsubscribe = onValue(pairQuery, (snapshot) => {
      if (snapshot.exists()) {
        const requests = Object.values(snapshot.val());
        const acceptedRequest = requests.find((req) => req.status === "accepted");
        const pendingRequest = requests.find((req) => req.status === "pending");

        setRequestStatus(
          acceptedRequest ? "accepted" :
            pendingRequest?.senderId === currentUserId ? "pending" : "none"
        );
      } else {
        setRequestStatus("none");
      }
    });

    return () => unsubscribe();
  }, [userId, auth.currentUser?.uid]);  // ✅ Теперь подписка обновляется при смене пользователя  

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = databaseRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        // Предполагается, что роль хранится в поле role
        setUserRole(userData?.role || '');
      });
    }
  }, [database]);

  const handleSendRequest = async () => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !userId) return;

    // Получаем данные текущего пользователя
    const currentUserSnapshot = await get(databaseRef(db, `users/${currentUserId}`));
    const currentUserData = currentUserSnapshot.val();

    // Создаем запрос
    const requestData = {
      senderId: currentUserId,
      receiverId: userId,
      status: "pending",
      pairId: [currentUserId, userId].sort().join("_"),
      timestamp: new Date().toISOString(),
    };

    // Сохраняем запрос
    // await set(databaseRef(db, `requests/${currentUserId}_${userId}`), requestData);
    const pairId = [currentUserId, userId].sort().join("_");
    await set(databaseRef(db, `requests/${pairId}`), {
      ...requestData,
      pairId
    });

    // Создаем уведомление
    const notificationData = {
      type: "conversation_request",
      senderId: currentUserId,
      senderName: currentUserData.username,
      senderAvatar: currentUserData.avatarUrl || "./default-image.png",
      timestamp: new Date().toISOString(),
    };

    const notificationsRef = databaseRef(db, `notifications/${userId}`);
    await push(notificationsRef, notificationData);

    setRequestStatus("pending");
  };

  useEffect(() => {
    const db = getDatabase();
    const userRef = databaseRef(db, `users/${userId}`);

    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData(data);
        setStatus(data.status || "offline");
        setLastActive(data.lastActive || "");
        setAvatarUrl(data.avatarUrl || "./default-image.png");
        setRole(data.role || "");
        setTeacherCathedra(data.cathedra || "не известно");
        setTeacherSubject(data.subject || "не известно");
        if (data.role === "teacher") {
          setTeacherTitle(data.runk || "Не указано");
        }
      }
    });

    return () => unsubscribeUser();
  }, [userId]);

  useEffect(() => {
    if (!userData?.email) return;

    const db = getDatabase();
    const requestRef = query(
      databaseRef(db, "requests"),
      orderByChild("email"),
      equalTo(userData.email)
    );

    const unsubscribeRequest = onValue(requestRef, (requestSnapshot) => {
      if (requestSnapshot.exists()) {
        const requestData = Object.values(requestSnapshot.val())[0];
        if (requestData.status === "accepted") {
          setIdentificationStatus(t('ident'));
          setUserFaculty(requestData.faculty || "не известно");
          setUserCourse(requestData.course || "не известно");
          setUserGroup(requestData.group || "не известно");
        } else {
          setIdentificationStatus(t('notident'));
          setUserFaculty("не известно");
          setUserCourse("не известно");
          setUserGroup("не известно");
        }
      } else {
        setIdentificationStatus(t('notident'));
        setUserFaculty("не известно");
        setUserCourse("не известно");
        setUserGroup("не известно");
      }
    });

    return () => unsubscribeRequest();
  }, [userData?.email, t]);    // Теперь подписка обновляется только если email изменился  

  const renderStatus = () => {
    return status === "online" ? (
      <span className="up-status-online">в сети</span>
    ) : (
      <span className="up-status-offline">был(а) в сети: {lastActive}</span>
    );
  };

  const handleCreateChat = async () => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !userId) return;

    const chatRoomId = generateUniqueChatId(currentUserId, userId);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    try {
      const chatSnapshot = await get(chatRoomRef);
      if (chatSnapshot.exists()) {
        navigate(`/chat/${chatRoomId}`);
        return;
      }

      const currentUserSnapshot = await get(databaseRef(db, `users/${currentUserId}`));
      const currentUserData = currentUserSnapshot.val();
      if (!currentUserData) {
        console.error("Не удалось загрузить данные текущего пользователя");
        return;
      }

      const chatRoomData = {
        participants: { [currentUserId]: true, [userId]: true },
        createdAt: new Date().toISOString(),
      };

      const currentUserChatData = {
        chatRoomId,
        recipientId: userId,
        recipientName: userData.username,
        recipientAvatar: userData.avatarUrl || "./default-image.png",
        lastMessage: "",
        timestamp: new Date().toISOString(),
      };

      const recipientChatData = {
        chatRoomId,
        recipientId: currentUserId,
        recipientName: currentUserData.username,
        recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
        lastMessage: "",
        timestamp: new Date().toISOString(),
      };

      await Promise.all([
        set(chatRoomRef, chatRoomData),
        set(databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`), currentUserChatData),
        set(databaseRef(db, `users/${userId}/chats/${chatRoomId}`), recipientChatData),
      ]);

      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
    }
  };

  // Генерация уникального ID чата
  const generateUniqueChatId = (id1, id2) => {
    const sortedIds = [id1, id2].sort(); // Сортировка ID для уникальности
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  if (!userData) {
    return <div className="loading-container">
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.p
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Идём к пользователю...
      </motion.p>
    </div>;
  }

  return (
    <div className="up-profile-container">
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
              <FiSearch className="menu-icon" style={{ background: "linear-gradient(60deg, rgb(219, 98, 98), rgba(0, 128, 107, 0.575), rgba(108, 108, 216, 0.66))", color: "white" }} />
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
            <FiSettings className="menu-icon" />
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
      <div className="up-profile-header" style={{ width: "100%" }}>
        <FaChevronLeft className="up-back-icon white-icon" style={{ marginTop: "3px" }} onClick={() => navigate(-1)} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
          <img
            src={userData.avatarUrl || "./default-image.png"}
            alt={userData.username}
            className="up-user-avatar skeleton-media-avatars"
            onClick={() => setIsAvatarModalOpen(true)}
          />
          <div>
            <h2 className="username txt">{userData.username}</h2>
            {renderStatus()}
          </div>
        </div>
        <FaEllipsisV className="up-menu-icon white-icon" style={{ marginTop: "5px", marginRight: "20px" }} />
      </div>

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

      {userRole === "dean" ? (
        <button className="up-chat-button" onClick={handleCreateChat}>
          Написать
        </button>
      ) : requestStatus === "accepted" ? (
        <button className="up-chat-button" onClick={handleCreateChat}>
          Написать
        </button>
      ) : requestStatus === "pending" ? (
        <button className="up-chat-button" disabled>
          Запрос отправлен
        </button>
      ) : (
        <button className="up-chat-button" onClick={handleSendRequest}>
          Отправить запрос на переписку
        </button>
      )}

      {(role === "teacher" || role === "dean") ? (
        <div style={{ marginBottom: "10px", color: "#bdcfe0" }}>
          <h3>Преподаватель</h3>
        </div>
      ) : (
        <div style={{ marginBottom: "10px", color: "#bdcfe0" }}>
          <h3>Студент</h3>
        </div>
      )}

      <div className="up-info-card">
        <div className="up-info-title">
          <FaPhone className="up-info-icon white-icon" />
          <p className="txt">{t('telnumber')}:</p>
        </div>
        <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
      </div>

      <div className="up-info-card">
        <div className="up-info-title">
          <FaUserEdit className="up-info-icon white-icon" />
          <p className="txt">{t('about')}:</p>
        </div>
        <div className="up-info-content">{userData.aboutMe || "Нет информации"}</div>
      </div>

      <div className="up-info-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
        <div className="up-info-title">
          <FaLock
            className={`up-info-icon white-icon ${identificationStatus === t('ident') ? "up-icon-verified" : "up-icon-unverified"
              }`}
          />
          <p className="txt">{t('identification')}:</p>
        </div>
        <div
          className={`up-info-content ${identificationStatus === t('ident') ? "up-status-verified" : "up-status-unverified"
            }`}
        >
          {identificationStatus}
        </div>
      </div>

      {(role === "teacher" || role === "dean") ? (
        <>
          <div className="up-info-card">
            <div className="up-info-title">
              <FaScroll className="up-info-icon white-icon" />
              <p className="txt">{t('cathedra')}:</p>
            </div>
            <div className="up-info-content"><p>{teacherCathedra}</p></div>
          </div>

          <div className="up-info-card" style={{ display: "flex", flexDirection: "row" }}>
            <div className="up-info-title">
              <FaUserGraduate className="up-info-icon white-icon" />
              <p className="txt">
                {role === 'dean' ? 'Должность:' : t('rank') + ':'}
              </p>
            </div>
            <div className="up-info-content">
              <p style={{ marginLeft: "15px" }}>
                {role === 'dean' ? 'Декан' : teacherTitle}
              </p>
            </div>
          </div>

          <div className="up-info-card" style={{ display: "flex", flexDirection: "row" }}>
            <div className="up-info-title">
              <FaBook className="up-info-icon white-icon" />
              <p className="txt"> {t('subject')}:</p>
            </div>
            <div className="up-info-content">
              <p style={{ marginLeft: "15px" }}>{TeacherSubject}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="up-info-card">
            <div className="up-info-title"><FaScroll className="up-info-icon white-icon" /><p className="txt">{t('cathedra')}:</p></div>
            <div className="up-info-content"><p>{userFaculty}</p></div>
          </div>

          <div className="up-info-card" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <div className="up-info-title"><FaUserGraduate className="up-info-icon white-icon" /><p className="txt">{t('course')}:</p></div>
            <div className="up-info-content" style={{ marginLeft: "15px" }}>{userCourse}</div>
          </div>

          <div className="up-info-card" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <div className="up-info-title"><FaUsers className="up-info-icon white-icon" style={{ fontSize: "20px" }} /><p className="txt">{t('group')}:</p></div>
            <div className="up-info-content" style={{ marginLeft: "15px" }}><p>{userGroup}</p></div>
          </div>
        </>
      )}

    </div>
  );
};

export default UserProfile;