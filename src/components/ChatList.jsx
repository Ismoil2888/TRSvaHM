import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  remove,
} from "firebase/database";
import "../ChatWithTeacher.css";
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";
import useTranslation from '../hooks/useTranslation';

const ChatList = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteForBoth, setDeleteForBoth] = useState(false);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Текущий пользователь
  const navigate = useNavigate();
  const t = useTranslation();
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
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
      const mobile = window.innerWidth < 800;
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

  const mainContentStyle = {
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "340px" : "80px"),
    transition: "margin 0.3s ease",
  };

  const HeaderDesktop = {
    margin: isMenuOpen ? "0px 80px" : "0px",
    transition: "margin 0.3s ease",
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

useEffect(() => {
  if (!currentUserId || !chatList.length) return;
  
  const db = getDatabase();
  const recipientsData = {};

  // Для каждого чата подписываемся на данные собеседника
  chatList.forEach(chat => {
    const recipientId = chat.chatRoomId.split('_').find(id => id !== currentUserId);
    
    if (recipientId && !recipientsData[recipientId]) {
      const recipientRef = databaseRef(db, `users/${recipientId}`);
      
      const unsubscribe = onValue(recipientRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setChatList(prev => prev.map(c => {
            if (c.chatRoomId === chat.chatRoomId) {
              return {
                ...c,
                recipientName: data.username,
                recipientAvatar: data.avatarUrl
              }
            }
            return c;
          }));
        }
      });
      
      recipientsData[recipientId] = unsubscribe;
    }
  });

  // Cleanup function
  return () => {
    Object.values(recipientsData).forEach(unsubscribe => unsubscribe());
  };
}, [chatList, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const db = getDatabase();
    const userChatsRef = databaseRef(db, `users/${currentUserId}/chats`);

    // Подписка на чаты пользователя
    const unsubscribeChats = onValue(userChatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedChats = Object.keys(data).map((chatRoomId) => ({
          chatRoomId,
          ...data[chatRoomId],
        }));

        // Сортировка по времени последнего сообщения
        loadedChats.sort((a, b) =>
          new Date(b.lastMessageTimestamp || b.timestamp) -
          new Date(a.lastMessageTimestamp || a.timestamp)
        );

        setChatList(loadedChats);

        // Подписка на сообщения для каждого чата
        loadedChats.forEach(chat => {
          const messagesRef = databaseRef(db, `chatRooms/${chat.chatRoomId}/messages`);
          onValue(messagesRef, (messagesSnapshot) => {
            const messagesData = messagesSnapshot.val();
            if (messagesData) {
              const messagesArray = Object.values(messagesData);
              const lastMessage = messagesArray[messagesArray.length - 1];

              // Обновляем timestamp последнего сообщения
              setChatList(prev => prev.map(c =>
                c.chatRoomId === chat.chatRoomId ?
                  { ...c, lastMessageTimestamp: lastMessage.timestamp } :
                  c
              ).sort((a, b) =>
                new Date(b.lastMessageTimestamp || b.timestamp) -
                new Date(a.lastMessageTimestamp || a.timestamp)
              ));

              // Считаем непрочитанные сообщения
              const unread = messagesArray.filter(msg =>
                msg.senderId !== currentUserId &&
                (!msg.seenBy || !msg.seenBy.includes(currentUserId))
              ).length;

              setUnreadCounts(prev => ({
                ...prev,
                [chat.chatRoomId]: unread
              }));
            }
          });
        });
      } else {
        setChatList([]);
      }
    });

    return () => {
      unsubscribeChats();
    };
  }, [currentUserId]);

  const handleClearHistory = (chatRoomId) => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    remove(messagesRef)
      .then(() => {
        showNotification("История чата очищена");
        setSelectedChatId(null)
      })
      .catch((error) => console.error("Ошибка при очистке истории:", error));
  };

  const handleDeleteChat = (chatRoomId, deleteForBoth) => {
    const db = getDatabase();
    const userChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    remove(userChatRef)
      .then(() => {
        if (deleteForBoth) {
          const recipientId = chatList.find(chat => chat.chatRoomId === chatRoomId)?.recipientId;
          if (recipientId) {
            const recipientChatRef = databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`);
            remove(recipientChatRef);
          }
        }
        // Удаляем саму комнату чата
        remove(chatRoomRef)
          .then(() => {
            setShowDeleteModal(false);
            showNotification("Чат удален");
            setSelectedChatId(null)
          })
          .catch((error) => console.error("Ошибка при удалении комнаты чата:", error));
      })
      .catch((error) => console.error("Ошибка при удалении чата:", error));
  };

  return (
    <div className="glava" style={{height: "100%"}}>
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
              <FiMessageSquare className="menu-icon" style={{ color: "orange" }} />
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
      <div className="chat-list-container" style={mainContentStyle}>
        {notification && (
          <div className={`notification ${notificationType}`}>
            {notification}
          </div>
        )} {/* Уведомление */}
        <div className="chat-list-head white-icon" style={HeaderDesktop}>
          <FaChevronLeft style={{ fontSize: "25px" }} onClick={() => navigate(-1)} />
          <h2 className="txt" style={{ marginRight: "160px" }}>{t('mychats')}</h2>
        </div>
        <ul className="chat-list" style={{overflowY: "scroll"}}>
          {chatList.map((chat) => (
            <li key={chat.chatRoomId} className="chat-list-item" onContextMenu={(e) => {
              e.preventDefault();
              setSelectedChatId(chat.chatRoomId);
            }}>
              <Link to={`/chat/${chat.chatRoomId}`} className="chat-link">
                <div className="chat-list-avatar-info">
                  <img
                    src={chat.recipientAvatar || "./default-image.png"}
                    alt={chat.recipientName}
                    className="chat-avatar skeleton-media-avatars"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "./default-image.png";
                    }}
                  />
                  <div className="chat-info">
                    <h3 className="chat-name">{chat.recipientName}</h3>
                    <p className="chat-last-message">{chat.lastMessage || "Откройте чат"}</p>
                  </div>
                </div>
                <div className="chat-status">
                  <span className="chat-timestamp">
                    {new Date(chat.lastMessageTimestamp || chat.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {unreadCounts[chat.chatRoomId] > 0 && (
                    <span className="unread-count">
                      {unreadCounts[chat.chatRoomId]}
                    </span>
                  )}
                </div>
              </Link>
              {selectedChatId && (
                <div className="actions-modal">
                  <div className="actions-modal-content">
                    <button
                      className="modal-close-button"
                      onClick={() => setSelectedChatId(null)}
                    >
                      &times;
                    </button>
                    <button
                      className="action-button"
                      onClick={() => handleClearHistory(selectedChatId)}
                    >
                      Очистить историю
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Удалить чат
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {showDeleteModal && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <button
                className="modal-close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
              <h3 className="modal-title">
                Удалить чат с {chatList.find(chat => chat.chatRoomId === selectedChatId)?.recipientName}?
              </h3>
              <p className="modal-subtitle">Это действие нельзя будет отменить</p>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={deleteForBoth}
                  onChange={(e) => setDeleteForBoth(e.target.checked)}
                />
                <span className="checkmark"></span>
                Также удалить для {chatList.find(chat => chat.chatRoomId === selectedChatId)?.recipientName}
              </label>

              <div className="modal-actions">
                <button
                  className="modal-button cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Отмена
                </button>
                <button
                  className="modal-button confirm-button"
                  onClick={() => handleDeleteChat(selectedChatId, deleteForBoth)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;