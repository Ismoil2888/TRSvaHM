import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaEllipsisV, FaEdit, FaTrash, FaReply, FaCopy, FaPaperclip } from "react-icons/fa";
import {
  getDatabase,
  ref as databaseRef,
  onValue,
  push,
  set,
  get,
  remove,
  update,
} from "firebase/database";
import { auth } from "../firebase";
import "../ChatWithTeacher.css";
import CryptoJS from 'crypto-js';
import { FiHome, FiUser, FiMessageSquare, FiBell, FiChevronLeft, FiChevronRight, FiSettings, FiBookOpen, FiUserCheck, FiSearch, FiFile, FiImage } from "react-icons/fi";
import basiclogo from "../basic-logo.png";
import ttulogo from "../Ttulogo.png";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import useTranslation from '../hooks/useTranslation';

const Chat = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserData, setCurrentUserData] = useState({});
  const [recipientData, setRecipientData] = useState({});
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const currentUserId = auth.currentUser?.uid;
  const [recipientStatus, setRecipientStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const messagesEndRef = useRef(null);
  const actionsRef = useRef(null);
  const [showChatActions, setShowChatActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
  const [deleteForBoth, setDeleteForBoth] = useState(false);
  const actionsModalRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
  const [messageToDelete, setMessageToDelete] = useState(null);
  const EMOJI_LIST = ['👍', '👎', '😄', '😡', '❤️', '🎉', '😢', '👀', '🔥', '🤔'];
  const QUICK_EMOJIS = ['👍', '❤️', '😄', '😡', '🎉'];
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [selectedEmojiMessageId, setSelectedEmojiMessageId] = useState(null);
  const t = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    // Восстанавливаем состояние из localStorage при инициализации
    const savedState = localStorage.getItem('isMenuOpen');
    return savedState ? JSON.parse(savedState) : true;
  });
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();
  const [viewingImage, setViewingImage] = useState(null);
  const longPressTimer = useRef(null);

  // Добавить обработчики после handleSendMessage
  const handleFileSelect = (type) => {
    setShowAttachmentMenu(false);
    if (type === 'image') {
      imageInputRef.current.click();
    } else {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e, isImage) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        file,
        type: isImage ? 'image' : 'file',
        preview: isImage ? URL.createObjectURL(file) : null
      });
    }
  };

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
    marginLeft: isMobile ? (isMenuOpen ? "360px" : "0px") : (isMenuOpen ? "360px" : "110px"),
    transition: "margin 0.3s ease",
  };

  const goToProfile = (recipientId) => {
    navigate(`/profile/${recipientId}`);
  };
  const SECRET_KEY = process.env.REACT_APP_CHAT_SECRET;

  const handleAddReaction = async (messageId, emoji) => {
    const db = getDatabase();
    const message = messages.find(m => m.id === messageId);

    // Проверка максимального количества реакций
    const userReactionsCount = Object.values(message?.reactions || {})
      .flat()
      .filter(r => r.userId === currentUserId).length;

    if (userReactionsCount >= 3 && !message.reactions?.[emoji]?.some(r => r.userId === currentUserId)) {
      showNotificationError("Максимум 3 реакции на сообщение");
      return;
    }

    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${messageId}/reactions/${emoji}`);
    const snapshot = await get(messageRef);
    const currentReactions = snapshot.val() || [];

    const userReactionIndex = currentReactions.findIndex(r => r.userId === currentUserId);

    if (userReactionIndex > -1) {
      // Удаляем реакцию
      const updatedReactions = currentReactions.filter(r => r.userId !== currentUserId);
      await set(messageRef, updatedReactions);
    } else {
      // Добавляем новую реакцию
      const newReaction = {
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        emoji
      };
      await set(messageRef, [...currentReactions, newReaction]);
    }

    // УБИРАЕМ РУЧНОЕ ОБНОВЛЕНИЕ СОСТОЯНИЯ
    setSelectedMessageId(null);
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

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    // 1. Загрузка данных текущего пользователя
    const loadCurrentUser = async () => {
      const snapshot = await get(databaseRef(db, `users/${currentUserId}`));
      if (snapshot.exists()) setCurrentUserData(snapshot.val());
    };

    // 2. Подписка на изменения чат-комнаты
    const unsubscribeChatRoom = onValue(chatRoomRef, (snapshot) => {
      const chatData = snapshot.val();
      if (chatData?.participants) {
        // Находим ID собеседника
        const otherParticipantId = Object.keys(chatData.participants)
          .find(id => id !== currentUserId);

        if (otherParticipantId) {
          setRecipientId(otherParticipantId);

          // 3. Подписка на данные собеседника
          const recipientRef = databaseRef(db, `users/${otherParticipantId}`);
          const unsubscribeRecipient = onValue(recipientRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setRecipientData(data);
              setRecipientStatus(data.status || "offline");
              setLastActive(data.lastActive || "");
            }
          });

          return () => unsubscribeRecipient(); // Отписка при изменении собеседника
        }
      }
    });

    const unsubscribeMessages = onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Обновление статуса просмотра (функция из unsubscribeMessages2)
        const updates = {};
        Object.entries(data).forEach(([key, message]) => {
          if (
            message.senderId !== currentUserId &&
            !message.seenBy?.includes(currentUserId)
          ) {
            updates[`${key}/seenBy`] = [...(message.seenBy || []), currentUserId];
          }
        });

        // Применяем обновления статуса просмотра
        if (Object.keys(updates).length > 0) {
          update(messagesRef, updates);
        }

        // Загрузка и обработка сообщений (функция из unsubscribeMessages1)
        const messagesArray = await Promise.all(
          Object.entries(data).map(async ([key, message]) => {
            const senderSnapshot = await get(databaseRef(db, `users/${message.senderId}`));

            // Обработка реакций
            const reactions = message.reactions ?
              Object.entries(message.reactions).reduce((acc, [emoji, reactions]) => {
                acc[emoji] = Array.isArray(reactions) ? reactions : [];
                return acc;
              }, {}) : {};

            return {
              id: key,
              ...message,
              text: decryptMessage(message.text),
              senderName: senderSnapshot.val()?.username || "Неизвестный",
              senderAvatar: senderSnapshot.val()?.avatarUrl || "./default-image.png",
              replyTo: message.replyTo ? {
                ...message.replyTo,
                text: decryptMessage(message.replyTo.text)
              } : null,
              reactions // Добавляем реакции
            };
          })
        );

        // Сортировка и обновление состояния
        messagesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(messagesArray);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });

    return () => unsubscribeMessages();

  }, [chatRoomId, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const db = getDatabase();
    const userStatusRef = databaseRef(db, `users/${currentUserId}/status`);
    const lastActiveRef = databaseRef(db, `users/${currentUserId}/lastActive`);

    set(userStatusRef, "online");

    const handleConnectionChange = (isOnline) => {
      set(userStatusRef, isOnline ? "online" : "offline");
      set(lastActiveRef, new Date().toISOString());
    };

    const handleVisibilityChange = () => {
      handleConnectionChange(document.visibilityState === "visible");
    };

    const handleBeforeUnload = () => handleConnectionChange(false);

    // Слушатели событий
    window.addEventListener("beforeunload", () => handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", () => handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handleConnectionChange(false);
    };
  }, [currentUserId]);

  // Рендер статуса
  const renderStatus = () => {
    if (recipientStatus === "online") {
      return <span className="status-online">в сети</span>;
    }

    if (lastActive && !isNaN(new Date(lastActive))) {
      const lastActiveTime = new Date(lastActive).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      return <span className="status-offline">был(а) в сети: {lastActiveTime}</span>;
    }

    return <span className="status-offline">не в сети</span>;
  };

  const handleMessageClick = (message, event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") return;

    // Закрываем меню при клике на то же сообщение
    if (selectedMessageId === message.id) {
      setSelectedMessageId(null);
      return;
    }

    // Сбрасываем таймер, если он уже был запущен
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Устанавливаем новый таймер
    longPressTimer.current = setTimeout(() => {
      // Открываем меню для нового сообщения
      setSelectedMessageId(message.id);
      longPressTimer.current = null;
    }, 500); // 0,5 секунды
  };

  const handleMessageMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMessageMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };


  // Удаление сообщения
  const handleDeleteMessage = (messageId) => {
    const db = getDatabase();
    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${messageId}`);
    remove(messageRef)
      .then(() => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
        setSelectedMessageId(null); // Закрываем меню действий
      })
      .catch((error) => console.error("Ошибка при удалении сообщения:", error));
  };

  // Редактирование сообщения
  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditMessageText(currentText);
    setSelectedMessageId(null); // Закрываем меню действий
  };

  const handleSaveEditedMessage = () => {
    if (editMessageText.trim() === "") return;

    const encryptedText = encryptMessage(editMessageText);
    const updatedMessage = {
      text: encryptedText,
      editedAt: new Date().toISOString()
    };

    const db = getDatabase();
    const messageRef = databaseRef(db, `chatRooms/${chatRoomId}/messages/${editingMessageId}`);

    update(messageRef, updatedMessage)
      .then(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === editingMessageId ? {
              ...msg,
              text: editMessageText,
              editedAt: updatedMessage.editedAt
            } : msg
          )
        );
        setEditingMessageId(null);
        setEditMessageText("");
      });
  };

  // Обновляем функцию копирования сообщения
  const handleCopyMessage = (ciphertext) => {
    const decryptedText = decryptMessage(ciphertext);
    navigator.clipboard.writeText(decryptedText)
      .then(() => {
        showNotification("Текст скопирован в буфер обмена");
      })
      .catch((err) => {
        console.error('Ошибка при копировании текста:', err);
      });
  };

  const hashMessage = (text) => {
    return CryptoJS.HmacSHA256(text, SECRET_KEY).toString();
  };

  // Модифицируем функцию отправки сообщения
  const encryptMessage = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  };

  const decryptMessage = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return "Не удалось расшифровать сообщение";
    }
  };

  // Модифицировать handleSendMessage
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !selectedFile) return;

    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    // Загрузка файла если есть
    if (selectedFile) {
      setUploading(true);
      try {
        const fileRef = storageRef(storage, `chatFiles/${Date.now()}_${selectedFile.file.name}`);
        const snapshot = await uploadBytes(fileRef, selectedFile.file);
        fileUrl = await getDownloadURL(snapshot.ref);
        fileType = selectedFile.type;
        fileName = selectedFile.file.name;
      } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        setUploading(false);
        return;
      }
    }

    // Шифруем сообщение
    const encryptedText = encryptMessage(newMessage);
    const encryptedReply = replyingTo ? {
      ...replyingTo,
      text: encryptMessage(replyingTo.text)
    } : null;

    const messageData = {
      senderId: currentUserId,
      senderName: currentUserData.username || "Вы",
      senderAvatar: currentUserData.avatarUrl || "./default-image.png",
      text: encryptedText,
      timestamp: new Date().toISOString(),
      seenBy: [],
      replyTo: encryptedReply,
      file: fileUrl ? { url: fileUrl, type: fileType, name: fileName } : null
    };

    // Оптимистичное добавление расшифрованного сообщения
    setMessages((prevMessages) => [...prevMessages, {
      ...messageData,
      text: newMessage,
      replyTo: replyingTo,
      file: fileUrl ? { url: fileUrl, type: fileType, name: fileName } : null
    }]);

    setNewMessage("");
    setSelectedFile(null);
    setUploading(false);

    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);

    push(messagesRef, messageData)
      .catch((error) => {
        console.error("Ошибка при отправке сообщения:", error);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.timestamp !== messageData.timestamp)
        );
      });

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key == 'Enter'){
      handleSendMessage(e);
    }
  }

  const handleClearHistory = () => {
    const db = getDatabase();
    const messagesRef = databaseRef(db, `chatRooms/${chatRoomId}/messages`);
    remove(messagesRef)
      .then(() => {
        setShowChatActions(false);
        navigate(-1);
      })
      .catch((error) => console.error("Ошибка при очистке истории:", error));
  };

  const handleDeleteChat = () => {
    const db = getDatabase();
    const currentUserChatRef = databaseRef(db, `users/${currentUserId}/chats/${chatRoomId}`);
    const chatRoomRef = databaseRef(db, `chatRooms/${chatRoomId}`);

    remove(currentUserChatRef)
      .then(() => {
        if (deleteForBoth && recipientId) {
          const recipientChatRef = databaseRef(db, `users/${recipientId}/chats/${chatRoomId}`);
          remove(recipientChatRef);
        }
        remove(chatRoomRef)
          .then(() => {
            setShowDeleteModal(false);
            navigate(-1); // Возвращаемся назад после удаления
          });
      })
      .catch((error) => console.error("Ошибка при удалении чата:", error));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setSelectedMessageId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="glava">
      {notification && (
        <div className={`notification ${notificationType}`}>
          {notification}
        </div>
      )}
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
            <FiHome className="menu-icon"  />
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
      <div className="chat-container" style={mainContentStyle}>
        <div className="chat-background"></div>
        <div className="chat-header">
          <FaChevronLeft
            style={{ marginLeft: "10px", color: "white", fontSize: "25px" }}
            onClick={() => navigate(-1)}
          />
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }} onClick={() => goToProfile(recipientId)}>
            <img
              src={recipientData.avatarUrl || "./default-image.png"}
              alt={recipientData.username || "Профиль"}
              className="chat-header-avatar"
              style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }}
            />
            <div className="chat-header-info">
              <h2>{recipientData.username || "Чат"}</h2>
              {renderStatus()}
            </div>
          </div>

          {/* Добавляем иконку меню */}
          <FaEllipsisV
            style={{ marginRight: "10px", cursor: "pointer", color: "white", fontSize: "25px" }}
            onClick={() => setShowChatActions(!showChatActions)}
          />

          {/* Модальное окно действий */}
          {showChatActions && (
            <div className="actions-modal" onClick={() => setShowChatActions(false)}>
              <div className="actions-modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  className="modal-close-button"
                  onClick={() => setShowChatActions(false)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
                <button className="action-button" onClick={handleClearHistory}>
                  Очистить историю
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => {
                    setShowChatActions(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Удалить чат
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Модальное окно подтверждения удаления */}
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
                Удалить чат с {recipientData.username}?
              </h3>
              <p className="modal-subtitle">Это действие нельзя будет отменить</p>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={deleteForBoth}
                  onChange={(e) => setDeleteForBoth(e.target.checked)}
                />
                <span className="checkmark"></span>
                Также удалить для {recipientData.username}
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
                  onClick={handleDeleteChat}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((message, index) => {
            const currentDate = new Date(message.timestamp);
            const prevMessage = messages[index - 1];
            const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;
            const showDate = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="chat-date-divider">
                    {currentDate.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                )}
                <div
                  className={`chat-message ${message.senderId === currentUserId
                    ? "chat-message-sent"
                    : "chat-message-received"
                    }`}
                  // onClick={(e) => handleMessageClick(message, e)}
                  onMouseDown={(e) => handleMessageClick(message, e)}
                  onMouseUp={handleMessageMouseUp}
                  onMouseLeave={handleMessageMouseLeave}
                  onTouchStart={(e) => handleMessageClick(message, e)}
                  onTouchEnd={handleMessageMouseUp}
                >
                  <img
                    src={message.senderAvatar || "./default-image.png"}
                    alt={message.senderName}
                    className="chat-message-avatar"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  />
                  <div>
                    <p style={{color: "#134474"}}>{message.senderName}</p>
                    {message.replyTo && (
                      <div className="message-reply">
                        <span>{message.replyTo.senderName}</span>
                        <p>{message.replyTo.text}</p>
                      </div>
                    )}
                    {editingMessageId === message.id ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="chat-cancel-edit-button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "red",
                            fontSize: "16px",
                            marginRight: "18px",
                            cursor: "pointer",
                          }}
                        >
                          ✖
                        </button>
                        <input
                          type="text"
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          className="chat-edit-input"
                        />
                      </div>
                    ) : (
                      <p className="chat-message-text">{message.text}
                        {message.file && (
                          <div
                            className={`file-message ${message.file.type === 'image' ? 'image-message' : ''}`}
                            onClick={() => {
                              if (message.file.type === 'image') {
                                setViewingImage(message.file.url);
                              } else {
                                window.open(message.file.url, '_blank');
                              }
                            }}
                          >
                            {message.file.type === 'image' ? (
                              <div className="file-preview">
                                <img src={message.file.url} alt="File preview" />
                              </div>
                            ) : (
                              <div className="file-preview">
                                <div className="file-icon">📎</div>
                                <span style={{ color: "grey" }}>{message.file.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {viewingImage && (
                          <div className="image-viewer-overlay" onClick={() => setViewingImage(null)}>
                              <button
                                className="close-button"
                                onClick={() => setViewingImage(null)}
                              >
                                &times;
                              </button>
                            <div className="image-viewer-content">
                              <img
                                src={viewingImage}
                                alt="Full size"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        )}

                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                          <div className="message-reactions">
                            {Object.entries(message.reactions).map(([emoji, reactions]) => {
                              const hasUserReaction = reactions.some(r => r.userId === currentUserId);
                              return (
                                <span
                                  key={emoji}
                                  className={`reaction-bubble ${hasUserReaction ? 'user-reaction' : ''}`}
                                  title={reactions.map(r => r.userId === currentUserId ? 'Вы' : r.userId).join(', ')}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddReaction(message.id, emoji);
                                  }}
                                >
                                  {emoji}
                                  {reactions.length > 1 && ` ${reactions.length}`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </p>
                    )}
                    <span className="chat-message-timestamp">
                      доставлено: {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {message.editedAt && (
                        <span className="chat-message-edited">
                          (изменено: {new Date(message.editedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })})
                        </span>
                      )}
                      {message.senderId === currentUserId && message.seenBy?.includes(recipientId) && (
                        <span className="chat-message-seen">просмотрено</span>
                      )}
                    </span>
                  </div>
                  {selectedMessageId === message.id && (
                    <div
                      className="chat-message-actions"
                      ref={actionsRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Закрываем меню только при клике на обычные кнопки, не эмодзи
                        if (!e.target.closest('.emoji-button, .emoji-more-button')) {
                          setSelectedMessageId(null);
                        }
                      }}
                    >
                      <div className="emoji-quick-bar">
                        {QUICK_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            className="emoji-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddReaction(message.id, emoji);
                              setSelectedMessageId(null); // Закрываем меню
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          className={`emoji-more-button ${showFullEmojiPicker ? 'open' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullEmojiPicker(!showFullEmojiPicker);
                          }}
                        >
                          ▼
                        </button>
                      </div>

                      {/* Полный список смайлов */}
                      {showFullEmojiPicker && (
                        <div className={`emoji-full-list ${showFullEmojiPicker ? 'open' : ''}`}>
                          {EMOJI_LIST.map(emoji => (
                            <button
                              key={emoji}
                              className="emoji-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddReaction(message.id, emoji);
                                setShowFullEmojiPicker(false);
                                setSelectedMessageId(null);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {message.senderId === currentUserId ? (
                        <>
                          <button onClick={() => setReplyingTo(message)}>
                            <FaReply /> Ответить
                          </button>
                          <button onClick={() => handleCopyMessage(message.text)}>
                            <FaCopy /> Копировать
                          </button>
                          <button onClick={() => handleEditMessage(message.id, message.text)}>
                            <FaEdit /> Редактировать
                          </button>
                          <button onClick={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteMessageModal(true);
                          }}>
                            <FaTrash /> Удалить
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setReplyingTo(message)}>
                            <FaReply /> Ответить
                          </button>
                          <button onClick={() => handleCopyMessage(message.text)}>
                            <FaCopy /> Копировать
                          </button>
                          <button onClick={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteMessageModal(true);
                          }}>
                            <FaTrash /> Удалить
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {showDeleteMessageModal && (
                    <div className="delete-message-modal" onClick={() => setShowDeleteMessageModal(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Вы уверены, что хотите удалить сообщение?</h3>
                        <div className="modal-buttons">
                          <button
                            className="cancel-message-button"
                            onClick={() => setShowDeleteMessageModal(false)}
                          >
                            Отмена
                          </button>
                          <button
                            className="delete-message-button"
                            onClick={() => {
                              if (messageToDelete) {
                                handleDeleteMessage(messageToDelete);
                              }
                              setShowDeleteMessageModal(false);
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, true)}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, false)}
          />

          {/* Добавить кнопку и меню выбора */}
          <div className="attachment-container">
            <FaPaperclip
              className="attachment-button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            />

            {showAttachmentMenu && (
              <div className="attachment-menu">
                <button style={{display: "flex", alignItems: "center", gap: "15px"}} onClick={() => handleFileSelect('image')}><FiImage /> Изображение</button>
                <button style={{display: "flex", alignItems: "center", gap: "15px"}} onClick={() => handleFileSelect('file')}><FiFile /> Документ или видео</button>
              </div>
            )}
          </div>
          {replyingTo && (
            <div className="reply-preview">
              <div className="reply-line"></div>
              <div className="reply-content">
                <span>{replyingTo.senderName}</span>
                <p>{replyingTo.text}</p>
                <button onClick={() => setReplyingTo(null)}>×</button>
              </div>
            </div>
          )}

          {/* Добавить превью выбранного файла */}
          {selectedFile && (
            <div className="file-preview">
              {selectedFile.type === 'image' ? (
                <img src={selectedFile.preview} alt="Preview" />
              ) : (
                <span>{selectedFile.file.name}</span>
              )}
              <button onClick={() => setSelectedFile(null)}>×</button>
            </div>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input-field"
            onKeyPress={handleKeyPress}
          />
          {editingMessageId ? (
            <button onClick={handleSaveEditedMessage} className="chat-send-button">
              Изменить
            </button>
          ) : (
            <button
              onClick={() => {
                if (replyingTo) {
                  // Отправка сообщения с прикрепленным ответом
                  handleSendMessage();
                  setReplyingTo(null);
                } else {
                  handleSendMessage();
                }
              }}
              className="chat-send-button"
              disabled={uploading}
            >
              {uploading ? (
                <div className="spinner"></div>
              ) : replyingTo ? "Ответить" : "Отправить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;