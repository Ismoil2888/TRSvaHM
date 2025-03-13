// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { auth } from "../firebase";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   get,
//   set,
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

//       <button className="up-chat-button" onClick={handleCreateChat}>
//         Написать
//       </button>
      
//     </div>
//   );
// };

// export default UserProfile;









// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { auth } from "../firebase";
// import {
//   getDatabase,
//   ref as databaseRef,
//   onValue,
//   get,
//   set,
//   push,
//   query,
//   orderByChild,
//   equalTo,
//   update
// } from "firebase/database";
// import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
// import "../UserProfile.css";
// import { motion } from "framer-motion";
// import useTranslation from "../hooks/useTranslation";
// import { LazyLoadImage } from "react-lazy-load-image-component";

// const UserProfile = React.memo(() => {
//   const { userId } = useParams();
//   const navigate = useNavigate();
//   const t = useTranslation();
//   const db = getDatabase();
//   const currentUserId = auth.currentUser?.uid;
  
//   const pairId = useMemo(() => [currentUserId, userId].sort().join("_"), [currentUserId, userId]);

//   const [profileData, setProfileData] = useState({
//     userData: null,
//     identificationStatus: t("notident"),
//     status: "offline",
//     lastActive: "",
//     avatarUrl: "./default-image.png",
//     requestStatus: "none",
//     isAvatarModalOpen: false,
//   });

//   useEffect(() => {
//     if (!currentUserId || !userId) return;

//     const userRef = databaseRef(db, `users/${userId}`);
//     get(userRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         setProfileData((prev) => ({
//           ...prev,
//           userData: data,
//           status: data.status || "offline",
//           lastActive: data.lastActive || "",
//           avatarUrl: data.avatarUrl || "./default-image.png",
//         }));

//         const requestRef = query(
//           databaseRef(db, "requests"),
//           orderByChild("email"),
//           equalTo(data.email || "")
//         );

//         onValue(requestRef, (requestSnapshot) => {
//           if (requestSnapshot.exists()) {
//             const requestData = Object.values(requestSnapshot.val())[0];
//             setProfileData((prev) => ({
//               ...prev,
//               identificationStatus: requestData.status === "accepted" ? t('ident') : t('notident'),
//             }));
//           } else {
//             setProfileData((prev) => ({
//               ...prev,
//               identificationStatus: t('notident'),
//             }));
//           }
//         });
//       }
//     });

//     const requestsRef = query(databaseRef(db, "requests"), orderByChild("pairId"), equalTo(pairId));
//     return onValue(requestsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const requests = Object.values(snapshot.val());
//         const acceptedRequest = requests.find((req) => req.status === "accepted");
//         const pendingRequest = requests.find((req) => req.status === "pending");

//         setProfileData((prev) => ({
//           ...prev,
//           requestStatus: acceptedRequest
//             ? "accepted"
//             : pendingRequest?.senderId === currentUserId
//             ? "pending"
//             : "none",
//         }));
//       }
//     });
//   }, [userId, pairId, t]);

//   const handleSendRequest = async () => {
//     if (!currentUserId || !userId) return;

//     const currentUserSnapshot = await get(databaseRef(db, `users/${currentUserId}`));
//     const currentUserData = currentUserSnapshot.val();

//     const requestData = {
//       senderId: currentUserId,
//       receiverId: userId,
//       status: "pending",
//       pairId: pairId,
//       timestamp: new Date().toISOString(),
//     };

//     const notificationData = {
//       type: "conversation_request",
//       senderId: currentUserId,
//       senderName: currentUserData.username,
//       senderAvatar: currentUserData.avatarUrl || "./default-image.png",
//       timestamp: new Date().toISOString(),
//     };

//     await set(databaseRef(db, `requests/${currentUserId}_${userId}`), requestData);
//     await push(databaseRef(db, `notifications/${userId}`), notificationData);

//     setProfileData((prev) => ({ ...prev, requestStatus: "pending" }));
//   };

//   const generateUniqueChatId = (id1, id2) => [id1, id2].sort().join("_");

//   const handleCreateChat = () => {
//     const chatRoomId = [currentUserId, userId].sort().join("_");
//     const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
//     const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
//     const recipientChatRef = databaseRef(db, `users/${userId}/chats/${chatRoomId}`);

//     get(databaseRef(db, `users/${currentUserId}`)).then((snapshot) => {
//       const currentUserData = snapshot.val();
      
//       get(chatRoomRef).then((snapshot) => {
//         if (!snapshot.exists()) {
//           set(chatRoomRef, {
//             participants: { [currentUserId]: true, [userId]: true },
//             createdAt: new Date().toISOString(),
//           });
//         }
//         navigate(`/chat/${chatRoomId}`);
//       });
//     });
//   };

//   const toggleAvatarModal = () => {
//     setProfileData((prev) => ({ ...prev, isAvatarModalOpen: !prev.isAvatarModalOpen }));
//   };

//   if (!profileData.userData) {
//     return <div className="loading-container">Загрузка...</div>;
//   }

//   return (
//     <div className="up-profile-container">
//       <div className="up-profile-header">
//         <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
//         <LazyLoadImage src={profileData.avatarUrl} alt="Avatar" className="up-user-avatar" onClick={toggleAvatarModal} />
//         <h2>{profileData.userData.username}</h2>
//         </div>
//         <FaEllipsisV className="up-menu-icon" />
//       </div>
//       {profileData.isAvatarModalOpen && (
//         <div className="avatar-modal" onClick={toggleAvatarModal}>
//           <div className="avatar-overlay">
//             <img src={profileData.avatarUrl} alt="Avatar" className="full-size-avatar" />
//           </div>
//         </div>
//       )}

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaPhone className="up-info-icon" />
//           Номер телефона
//         </div>
//         <div className="up-info-content">{profileData.userData.phoneNumber || "Не указан"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaUserEdit className="up-info-icon" />
//           О себе
//         </div>
//         <div className="info-content">{profileData.userData.aboutMe || "Нет информации"}</div>
//       </div>

//       <div className="up-info-card">
//         <div className="up-info-title">
//           <FaLock
//             className={`up-info-icon ${
//               profileData.identificationStatus === t('ident') ? "up-icon-verified" : "up-icon-unverified"
//             }`}
//           />
//         </div>
//         <div
//           className={`up-info-content ${
//             profileData.identificationStatus === t('ident') ? "up-status-verified" : "up-status-unverified"
//           }`}
//         >
//           {profileData.identificationStatus}
//         </div>
//       </div>

//       {profileData.requestStatus === "accepted" ? (
//         <button className="up-chat-button" onClick={handleCreateChat}>Написать</button>
//       ) : profileData.requestStatus === "pending" ? (
//         <button className="up-chat-button" disabled>Запрос отправлен</button>
//       ) : (
//         <button className="up-chat-button" onClick={handleSendRequest}>Отправить запрос</button>
//       )}
//     </div>
//   );
// });

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
import { FaLock, FaPhone, FaUserEdit, FaChevronLeft, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../UserProfile.css";
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    
    if (!currentUserId || !userId) return;

    // Проверяем существующие запросы между пользователями
    const pairId = [currentUserId, userId].sort().join("_");
    const requestsRef = databaseRef(db, "requests");
    const pairQuery = query(requestsRef, orderByChild("pairId"), equalTo(pairId));

    const unsubscribe = onValue(pairQuery, (snapshot) => {
      if (snapshot.exists()) {
        const requests = Object.values(snapshot.val());
        const acceptedRequest = requests.find((req) => req.status === "accepted");
        const pendingRequest = requests.find((req) => req.status === "pending");

        if (acceptedRequest) {
          setRequestStatus("accepted");
        } else if (pendingRequest) {
          setRequestStatus(pendingRequest.senderId === currentUserId ? "pending" : "none");
        } else {
          setRequestStatus("none");
        }
      } else {
        setRequestStatus("none");
      }
    });

    return () => unsubscribe();
  }, [userId]);

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
    await set(databaseRef(db, `requests/${currentUserId}_${userId}`), requestData);

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
  
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData(data);
        setStatus(data.status || "offline");
        setLastActive(data.lastActive || "");
        setAvatarUrl(data.avatarUrl || "./default-image.png");
  
        // ПЕРЕНЕСИТЕ ЭТОТ КОД СЮДА
        const requestRef = query(
          databaseRef(db, "requests"),
          orderByChild("email"),
          equalTo(data.email || "") // Используем email из полученных данных
        );
  
        onValue(requestRef, (requestSnapshot) => {
          if (requestSnapshot.exists()) {
            const requestData = Object.values(requestSnapshot.val())[0];
            setIdentificationStatus(
              requestData.status === "accepted" ? t('ident') : t('notident')
            );
          } else {
            setIdentificationStatus(t('notident'));
          }
        });
      }
    });
  }, [userId, t]);

  const renderStatus = () => {
    return status === "online" ? (
      <span className="up-status-online">в сети</span>
    ) : (
      <span className="up-status-offline">был(а) в сети: {lastActive}</span>
    );
  };

  const handleCreateChat = () => {
    const db = getDatabase();
    const currentUserId = auth.currentUser?.uid;
    const chatRoomId = generateUniqueChatId(currentUserId, userId); // userId — ID собеседника
  
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);
    const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
    const recipientChatRef = databaseRef(db, `users/${userId}/chats/${chatRoomId}`);
  
    get(databaseRef(db, `users/${currentUserId}`)).then((snapshot) => {
      const currentUserData = snapshot.val();
  
      if (!currentUserData) {
        console.error("Не удалось загрузить данные текущего пользователя");
        return;
      }
  
      get(chatRoomRef).then((snapshot) => {
        if (snapshot.exists()) {
          // Если чат уже существует, просто переходим в него
          navigate(`/chat/${chatRoomId}`);
        } else {
          // Создаем новый чат
          const chatRoomData = {
            participants: {
              [currentUserId]: true,
              [userId]: true,
            },
            createdAt: new Date().toISOString(),
          };
  
          const currentUserChatData = {
            chatRoomId,
            recipientId: userId,
            recipientName: userData.username, // Имя получателя
            recipientAvatar: userData.avatarUrl || "./default-image.png",
            lastMessage: "",
            timestamp: new Date().toISOString(),
          };
  
          const recipientChatData = {
            chatRoomId,
            recipientId: currentUserId,
            recipientName: currentUserData.username, // Имя текущего пользователя
            recipientAvatar: currentUserData.avatarUrl || "./default-image.png",
            lastMessage: "",
            timestamp: new Date().toISOString(),
          };
  
          Promise.all([
            set(chatRoomRef, chatRoomData),
            set(currentUserChatRef, currentUserChatData),
            set(recipientChatRef, recipientChatData),
          ])
            .then(() => navigate(`/chat/${chatRoomId}`))
            .catch((error) => console.error("Ошибка при создании чата:", error));
        }
      });
    });
  };
  
  // Генерация уникального ID чата
  const generateUniqueChatId = (id1, id2) => {
    const sortedIds = [id1, id2].sort(); // Сортировка ID для уникальности
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };  

  if (!userData) {
    return  <div className="loading-container">
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
    <style jsx>{`
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: radial-gradient(circle, #1a1a2e, #16213e);
        color: white;
        font-family: Arial, sans-serif;
      }
      .spinner {
        width: 60px;
        height: 60px;
        border: 6px solid rgba(255, 255, 255, 0.3);
        border-top-color: #00d4ff;
        border-radius: 50%;
        margin-bottom: 20px;
      }
      .loading-text {
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 1.5px;
      }
    `}</style>
  </div>;
  }

  return (
    <div className="up-profile-container">
      <div className="up-profile-header">
        <FaChevronLeft className="up-back-icon" onClick={() => navigate(-1)} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "320px" }}>
          <img
            src={userData.avatarUrl || "./default-image.png"}
            alt={userData.username}
            className="up-user-avatar skeleton-media-avatars"
            onClick={() => setIsAvatarModalOpen(true)}
          />
          <div>
            <h2 className="username">{userData.username}</h2>
            {renderStatus()}
          </div>
        </div>
        <FaEllipsisV className="up-menu-icon" />
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

      <div className="up-info-card">
        <div className="up-info-title">
          <FaPhone className="up-info-icon" />
          Номер телефона
        </div>
        <div className="up-info-content">{userData.phoneNumber || "Не указан"}</div>
      </div>

      <div className="up-info-card">
        <div className="up-info-title">
          <FaUserEdit className="up-info-icon" />
          О себе
        </div>
        <div className="info-content">{userData.aboutMe || "Нет информации"}</div>
      </div>

      <div className="up-info-card">
        <div className="up-info-title">
          <FaLock
            className={`up-info-icon ${
              identificationStatus === t('ident') ? "up-icon-verified" : "up-icon-unverified"
            }`}
          />
          Идентификация
        </div>
        <div
          className={`up-info-content ${
            identificationStatus === t('ident') ? "up-status-verified" : "up-status-unverified"
          }`}
        >
          {identificationStatus}
        </div>
      </div>

      {requestStatus === "accepted" ? (
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
      
    </div>
  );
};

export default UserProfile;