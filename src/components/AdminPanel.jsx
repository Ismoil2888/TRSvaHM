import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminPanel.css';
import '../App.css';
import defaultAvatar from "../default-image.png";
import defaultTeacherImg from "../teacher.svg";
import useTranslation from '../hooks/useTranslation';
import useTeachers from "../hooks/useTeachers";
import useRequests from "../hooks/useRequests";
import {
  uploadTeacherPhoto,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../services/teacherService';
import useScheduleEditor from "../hooks/useScheduleEditor";
import useComments from "../hooks/useComments";
import usePostsModeration from "../hooks/usePostsModeration";
import useUsers from "../hooks/useUsers";

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
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', surname: '', subject: '', runk: '', login: '', password: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { teachers, filteredTeachers, searchQuery, search, select } = useTeachers();
  const {
    requests,
    newRequestsCount,
    handleAcceptRequest,
    handleRejectRequest,
    handleEditRequest,
    handleDeleteRequest,
    rejectModal,
    setRejectModal,
    cancelReject,
    confirmRejectSend,
    confirmDeleteReq,
    openDeleteReqModal,
    cancelDeleteReq,
    confirmDeleteReqAction
  } = useRequests();
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const {
    selectedCourse,
    selectedGroup,
    scheduleData,
    isScheduleLoading,
    showScheduleEditor,
    setShowScheduleEditor,
    handleCourseSelect,
    handleGroupSelect,
    handleSaveSchedule,
    addLesson,
    updateLesson,
    removeLesson,
    daysOrder
  } = useScheduleEditor();
  const {
    userComments,
    teacherComments,
    userMap,
    postCommentsCount,
    teacherCommentsCount,
    deletePostComment,
    deleteTeacherComment,
  } = useComments();
  const {
    pendingPosts,
    isLoading: postsLoading,
    approvePost,
    rejectPost
  } = usePostsModeration();
  const {
    users,
    isLoading: usersLoading,
    fetchUsers: refreshUsers,
    deleteUser,
    pwaInstallCount
  } = useUsers();
  const [userSearch, setUserSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, commentId: null });
  const [showComments, setShowComments] = useState(false);
  const [showTeacherComments, setShowTeacherComments] = useState(false);
  const [confirmTeacherCommentDelete, setConfirmTeacherCommentDelete] = useState({ isOpen: false, commentId: null, teacherId: null });
  // const [userMap, setUserMap] = useState({}); // Словарь userId -> username
  const [searchUserCommentQuery, setSearchUserCommentQuery] = useState("");
  const [filteredUserComments, setFilteredUserComments] = useState([]);
  const [searchTeacherCommentQuery, setSearchTeacherCommentQuery] = useState("");
  const [filteredTeacherComments, setFilteredTeacherComments] = useState([]);
  const [showPosts, setShowPosts] = useState(false);
  const navigate = useNavigate();
  const t = useTranslation();
  const [showUsersList, setShowUsersList] = useState(false);
  // const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserActionsOpen, setIsUserActionsOpen] = useState(false);
  const [blockedIPs, setBlockedIPs] = useState({});

  // Helper to convert IP to DB key
  // function ipToKey(ip) {
  //   return ip.replace(/\./g, '_');
  // }

  // 2) Фильтруем пользователей по имени или почте
// вместо u.username.toLowerCase() и (u.email||"").toLowerCase()
const filteredUsers = users.filter(u => {
  const q = userSearch.trim().toLowerCase();
  const name = (u.username || "").toLowerCase();
  const email = (u.email || "").toLowerCase();
  return name.includes(q) || email.includes(q);
});

  const toggleUsersList = () => {
    if (!showUsersList) {
      refreshUsers();
    }
    setShowUsersList(prev => !prev);
  };

  // Teacher CRUD
  const handleSaveTeacher = async () => {
    if (!newTeacher.name || !newTeacher.subject) return;
    setIsLoading(true);
    let photoURL = '';
    if (photoFile) {
      try {
        photoURL = await uploadTeacherPhoto(photoFile);
      } catch {
        toast.error("Ошибка при загрузке фото");
        setIsLoading(false);
        return;
      }
    }
    const payload = { ...newTeacher, avatarUrl: photoURL };
    try {
      if (editingTeacherId) {
        await updateTeacher(editingTeacherId, payload);
        toast.success('Преподаватель обновлён');
      } else {
        await createTeacher(payload);
        toast.success('Преподаватель добавлен');
      }
      setIsEditing(false);
      setNewTeacher({ name: '', surname: '', subject: '', runk: '', login: '', password: '' });
      setPhotoFile(null);
      setEditingTeacherId(null);
    } catch {
      toast.error("Ошибка при сохранении преподавателя");
    }
    setIsLoading(false);
  };

  const handleEditTeacher = (t) => {
    setNewTeacher(t);
    setEditingTeacherId(t.id);
    setIsEditing(true);
  };

  const handleDeleteTeacher = async (id) => {
    try {
      await deleteTeacher(id);
      toast.success('Преподаватель удалён');
    } catch {
      toast.error('Ошибка при удалении преподавателя');
    }
  };

  // синхронизируем при изменении списков из API
  useEffect(() => {
    setFilteredUserComments(userComments);
  }, [userComments]);

  useEffect(() => {
    setFilteredTeacherComments(teacherComments);
  }, [teacherComments]);

  // фильтрация по поиску
  useEffect(() => {
    setFilteredUserComments(
      userComments.filter(c =>
        c.comment.toLowerCase().includes(searchUserCommentQuery.toLowerCase()) ||
        (c.username || "").toLowerCase().includes(searchUserCommentQuery.toLowerCase())
      )
    );
  }, [searchUserCommentQuery, userComments]);

  useEffect(() => {
    setFilteredTeacherComments(
      teacherComments.filter(c =>
        c.comment.toLowerCase().includes(searchTeacherCommentQuery.toLowerCase()) ||
        (c.username || "").toLowerCase().includes(searchTeacherCommentQuery.toLowerCase())
      )
    );
  }, [searchTeacherCommentQuery, teacherComments]);

  // Переключение показа комментариев
  const toggleShowComments = () => setShowComments(prev => !prev);

  // Подтвердить удаление комментария к посту
  const confirmDeleteComment = () => {
    deletePostComment(confirmDelete.commentId, confirmDelete.postId);
    setConfirmDelete({ isOpen: false, commentId: null, postId: null });
  };

  // Отмена удаления комментария к посту
  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, commentId: null, postId: null });
  };

  // Подтвердить удаление отзыва об учителе
  const confirmTeacherCommentDeleteAction = () => {
    deleteTeacherComment(confirmTeacherCommentDelete.commentId, confirmTeacherCommentDelete.teacherId);
    setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
  };

  // Отмена удаления отзыва об учителе
  const cancelTeacherCommentDelete = () => {
    setConfirmTeacherCommentDelete({ isOpen: false, commentId: null, teacherId: null });
  };

  const goToProfile = (userId) => navigate(`/profile/${userId}`);

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
          {usersLoading && <span style={{ marginLeft: 8 }}>🔄</span>}
        </button>
        {/* <div className="txt" style={{ fontSize: "18px" }}>
          📲 Установок приложения: <strong>{pwaInstallCount}</strong>
        </div> */}
      </div>

      {/* Сам список */}
{showUsersList && (
  <div className="users-list">
    <h2>Все зарегистрированные пользователи:</h2>
    <input
      type="search"
      placeholder="Поиск по имени или e-mail…"
      value={userSearch}
      onChange={e => setUserSearch(e.target.value)}
      style={{ marginBottom: 12, width: "100%", padding: "6px 8px" }}
    />
    <p className="txt" style={{ marginBottom: 8 }}>
      📲 Установок приложения: <strong>{pwaInstallCount}</strong>
    </p>

    {usersLoading ? (
      <p className="txt">Загрузка пользователей…</p>
    ) : (
      <ul className="txt">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <li key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '5px', borderBottom: '1px solid grey' }}>
              <div style={{ flex: 1 }}>
                <strong>{user.username || "—"}</strong> — {user.email || 'email не указан'}
              </div>
              <FaEdit
                style={{ cursor: 'pointer', marginLeft: 8 }}
                onClick={() => {
                  setSelectedUser(user);
                  setIsUserActionsOpen(true);
                }}
              />
            </li>
          ))
        ) : (
          <li style={{ padding: 10, color: '#666' }}>Ничего не найдено.</li>
        )}
      </ul>
    )}
  </div>
)}

      {/* Модалка действий над выбранным пользователем */}
      {isUserActionsOpen && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-window">
            <h3>Действие для «{selectedUser.username}»</h3>

            {/* Удалить через хук */}
            <button
              onClick={() => {
                if (window.confirm('Вы точно хотите удалить этого пользователя?')) {
                  deleteUser(selectedUser.id);
                  setIsUserActionsOpen(false);
                }
              }}
            >
              Удалить аккаунт
            </button>

            {/* Остальные кнопки блокировки/разблокировки */}
            {/* {blockedIPs[selectedUser.ipAddress] ? (
              <button
                onClick={() => {
                  if (window.confirm(`Разблокировать IP ${selectedUser.ipAddress}?`)) {
                    handleUnblockUser(selectedUser.ipAddress);
                    setIsUserActionsOpen(false);
                  }
                }}
              >
                Разблокировать по IP
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm(`Заблокировать IP ${selectedUser.ipAddress}?`)) {
                    handleBlockUser(selectedUser.ipAddress);
                    setIsUserActionsOpen(false);
                  }
                }}
              >
                Заблокировать по IP {selectedUser.ipAddress}
              </button>
            )} */}

            <button onClick={() => setIsUserActionsOpen(false)}>Отмена</button>
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
              onChange={e => setSearchUserCommentQuery(e.target.value)}
            />
            <div id="users-comments">
              {filteredUserComments.map(comment => (
                <div className="adm-user-comment" key={comment.id}>
                  <img
                    src={comment.avatarUrl || defaultAvatar}
                    alt={comment.username}
                    className="adm-comment-avatar"
                  />
                  <div className="adm-comment-details">
                    <p
                      className="adm-comment-username"
                      onClick={() => goToProfile(comment.userId)}
                    >
                      {comment.username}
                      {comment.anonymousOwnerId && (
                        <span>
                          (Автор: {userMap[comment.anonymousOwnerId]})
                        </span>
                      )}
                    </p>
                    <p className="adm-comment-text">{comment.comment}</p>
                    <span className="adm-comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <button
                    className="delete-comment-btn"
                    onClick={() => deletePostComment(comment.id, comment.postId)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="toggle-comments-btn"
          onClick={() => setShowTeacherComments(prev => !prev)}
        >
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
              onChange={e => setSearchTeacherCommentQuery(e.target.value)}
            />
            <div id="users-tch-comments">
              {filteredTeacherComments.map(comment => (
                <div className="adm-user-comment" key={comment.id}>
                  <img
                    src={comment.avatarUrl || defaultAvatar}
                    alt={comment.username}
                    className="adm-comment-avatar"
                    onClick={() => goToProfile(comment.userId)}
                  />
                  <div className="adm-comment-details">
                    <p
                      className="adm-comment-username"
                      onClick={() => goToProfile(comment.userId)}
                    >
                      {comment.username}
                      {comment.anonymousOwnerId && (
                        <span>
                          (Автор: {userMap[comment.anonymousOwnerId]})
                        </span>
                      )}
                    </p>
                    <p className="adm-comment-text">{comment.comment}</p>
                    <span className="adm-comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <button
                    className="delete-comment-btn"
                    onClick={() => setConfirmTeacherCommentDelete({ isOpen: true, commentId: comment.id, teacherId: comment.teacherId })}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}



        <h2 style={{ marginTop: "35px" }}>Заявки Публикаций</h2>
        <button
          className="ap-buttons-add-edit"
          onClick={() => setShowPosts(prev => !prev)}
        >
          {showPosts ? "Скрыть посты" : "Показать посты"}
          {pendingPosts.length > 0 && (
            <span className="comments-count">{pendingPosts.length}</span>
          )}
        </button>

        {showPosts && (
          <div id="user-posts">
            {postsLoading ? (
              <p>Загрузка...</p>
            ) : pendingPosts.length > 0 ? (
              pendingPosts.map(post => (
                <div key={post.id} className="adm-post-item">
                  <div className="adm-post-header">
                    <img
                      src={post.userAvatar || defaultAvatar}
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
                    <button
                      className="approve-btn"
                      onClick={() => approvePost(post.id)}
                    >
                      Одобрить
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => rejectPost(post.id)}
                    >
                      Отклонить
                    </button>
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
                  {/* <p style={{ margin: 0 }}>{request.username}</p>
                  <p>{request.email}</p> */}
                </div>

                <div className="compact-content">
                  {request.photoUrl && (
                    <img
                      src={request.photoUrl}
                      alt="Фото студента"
                      className="compact-photo"
                    />
                  )}
                  <div className="compact-info">
                    <p>{request.username}</p>
                    <p>{request.email}</p>
                    <p className={`status-label ${request.status === 'accepted' ? 'accepted' : 'rejected'}`}>
                      {request.status === 'accepted' ? 'Идентифицирован' : 'Не идентифицирован'}
                    </p>
                  </div>
                  <FaEdit
                    className="edit-icon-request-card"
                    // onClick={() => handleEditRequest(request.id)}
                    onClick={() => {
                      handleEditRequest(request.id);
                      setIsEditingRequest(true);
                      setEditingRequestId(request.id);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejectModal.isOpen && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>
              Укажите причину отклонения заявки пользователя «<strong>{rejectModal.username}</strong>»:
            </p>
            <textarea
              style={{ width: "90%", padding: "10px" }}
              rows={4}
              value={rejectModal.reason}
              onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Напишите причину..."
            />
            <div className="confirm-buttons">
              <button disabled={!rejectModal.reason.trim()} onClick={confirmRejectSend}>Отправить</button>
              <button onClick={cancelReject}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteReq.isOpen && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>
              Вы уверены, что хотите удалить заявку от пользователя «<strong>{confirmDeleteReq.username}</strong>»?
            </p>
            <div className="confirm-buttons">
              <button onClick={confirmDeleteReqAction}>Удалить</button>
              <button onClick={cancelDeleteReq}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {isEditingRequest && editingRequestId && (
        <div className="edit-request-modal">
          <div style={{ background: "white", color: "black", width: "345px", padding: "10px", gap: "10px", borderRadius: "15px" }} className="modal--request-content">
            <h3>Редактирование заявки</h3>
            {(() => {
              const request = requests.find(r => r.id === editingRequestId);
              if (!request) return <p>Загрузка...</p>;

              return (
                <div className='request-card-info'>
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
                    <p>{request.email}</p>
                  </div><hr />
                  <p>ФИО: {request.fio}</p><hr />
                  <p>Кафедра: {request.faculty}</p><hr />
                  <p>Курс: {request.course}</p><hr />
                  <p>Группа: {request.group}</p><hr />
                  {request.photoUrl && (
                    <img
                      src={request.photoUrl}
                      alt="Фото студенческого билета"
                      className="request-card-photo"
                      style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
                    />
                  )}
                  <div className="request-card-buttons">
                    <button className='request-card-button-accept'
                      onClick={async () => {
                        await handleAcceptRequest(request.id);
                        setIsEditingRequest(false); // Закрыть окно после принятия
                      }}
                    >
                      Принять
                    </button>
                    <button onClick={() => setRejectModal({
                      isOpen: true,
                      id: request.id,
                      senderId: request.userId,
                      username: request.username,
                      reason: ''
                    })}
                      className='request-card-button-reject'
                    >Отклонить</button>
                    <button
                      className='request-card-button-delete'
                      onClick={() => openDeleteReqModal(request.id, request.username)}>Удалить</button>
                    <button
                      className='request-card-button-close'
                      onClick={() => setIsEditingRequest(false)}>Закрыть</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {isEditing && !isLoading && (
        <div className="adm-modal">
          <div className="adm-modal-content">
            <h2>{editingTeacherId ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h2>
            <input
              type="text"
              placeholder="ФИО"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
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
              value={newTeacher.runk}
              onChange={(e) => setNewTeacher({ ...newTeacher, runk: e.target.value })}
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
            onChange={(e) => search(e.target.value)}
          />
          {searchQuery && (
            <div className="search-suggestions">
              {filteredTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className="suggestion-item"
                  onClick={() => select(teacher)}
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
                  <img src={teacher.avatarUrl || defaultTeacherImg} alt={`${teacher.name}`} />
                  <FaEdit className="edit-icon" onClick={() => handleEditTeacher(teacher)} />
                </div>
                <div className="card-body">
                  <h3>{`${teacher.name}`}</h3>
                  <p><strong>Предмет:</strong> {teacher.subject}</p>
                  <p><strong>Статус:</strong> {teacher.runk}</p>
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

      {/* Модальное окно для редактирования расписания выбранной группы */}
      {showScheduleEditor && (
        <div className="schedule-modal-overlay">
          <div className="schedule-modal-content">
            <h2>Расписание уроков</h2>

            <label>Выберите курс:</label>
            <select value={selectedCourse} onChange={handleCourseSelect}>
              <option value="">-- Выберите курс --</option>
              <option value="1">1 курс</option>
              <option value="2">2 курс</option>
              <option value="3">3 курс</option>
              <option value="4">4 курс</option>
            </select>

            <label style={{ marginTop: '10px' }}>Выберите группу:</label>
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

            {selectedCourse && selectedGroup ? (
              isScheduleLoading ? (
                <p style={{ marginTop: "20px" }}>Загрузка расписания...</p>
              ) : (
                <>
                  {daysOrder.map((dayKey) => (
                    <div key={dayKey} className="day-schedule">
                      <h3>{t(dayKey)}</h3>
                      {(scheduleData?.[dayKey] || []).map((lesson, index) => (
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
                          <input
                            type="text"
                            placeholder="Аудитория"
                            value={lesson.audience}
                            onChange={e => updateLesson(dayKey, index, 'audience', e.target.value)}
                            className="lesson-input audience-input"
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
                  ))}
                  <div className="schedule-modal-buttons">
                    <button onClick={handleSaveSchedule}>Сохранить расписание</button>
                    <button onClick={() => setShowScheduleEditor(false)}>Закрыть</button>
                  </div>
                </>
              )
            ) : (
              <p style={{ marginTop: "20px", fontStyle: "italic" }}>
                Сначала выберите курс и группу.
              </p>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminPanel;