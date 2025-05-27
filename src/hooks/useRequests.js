import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useRequests = () => {
  const [requests, setRequests] = useState([]);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    id: null,
    senderId: null,
    username: '',
    reason: ''
  });

  const [confirmDeleteReq, setConfirmDeleteReq] = useState({
    isOpen: false,
    id: null,
    username: ''
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/requests`);
        const data = await res.json();
        setRequests(data);
        setNewRequestsCount(data.filter(r => r.status === 'pending').length);
      } catch (err) {
        toast.error("Ошибка при загрузке заявок");
      }
    };

    fetchRequests();
  }, []);

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API_BASE}/api/requests`)
  //     .then(res => res.json())
  //     .then(data => {
  //       setRequests(data);
  //       setNewRequestsCount(data.filter(r => r.status === 'pending').length);
  //     })
  //     .catch(() => toast.error("Ошибка при загрузке заявок"));
  // }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE}/api/requests/${requestId}/accept`, { method: "POST" });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "accepted" } : r));
      toast.success("Заявка принята");
    } catch {
      toast.error("Ошибка при принятии заявки");
    }
  };

  const handleEditRequest = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE}/api/requests/${id}/edit`, { method: "POST" });
  
      // Мгновенно обновляем стейт, чтобы отразилось в UI
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "pending" } : r
        )
      );
  
      toast.info("Заявка возвращена для редактирования");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при возврате заявки");
    }
  };

  const confirmRejectSend = async () => {
    const { id, senderId, reason } = rejectModal;
    if (!reason.trim()) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE}/api/requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, reason })
      });
      cancelReject();
      toast.success("Заявка отклонена");
    } catch {
      toast.error("Ошибка при отклонении заявки");
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE}/api/requests/${requestId}`, { method: "DELETE" });
      toast.success("Заявка удалена");
    } catch {
      toast.error("Ошибка при удалении заявки");
    }
  };

  const confirmDeleteReqAction = async () => {
    const { id } = confirmDeleteReq;
    if (!id) return;
    try {
      await deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
    setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
  };

  const cancelReject = () => {
    setRejectModal({ isOpen: false, id: null, senderId: null, username: '', reason: '' });
  };

  const cancelDeleteReq = () => {
    setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
  };

  const openDeleteReqModal = (id, username) => {
    setConfirmDeleteReq({ isOpen: true, id, username });
  };

  return {
    requests,
    newRequestsCount,
    handleAcceptRequest,
    handleEditRequest,
    confirmRejectSend,
    cancelReject,
    deleteRequest,
    setRequests,
    setNewRequestsCount,
    rejectModal,
    setRejectModal,
    confirmDeleteReq,
    setConfirmDeleteReq,
    openDeleteReqModal,
    cancelDeleteReq,
    confirmDeleteReqAction,
  };
};

export default useRequests;










// import { useState, useEffect } from "react";
// import { getDatabase, ref, get, onValue, set, update, remove, push } from "firebase/database";
// import { toast } from "react-toastify";
// import defaultAvatar from "../default-image.png";

// const useRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [newRequestsCount, setNewRequestsCount] = useState(0);
//   const [rejectModal, setRejectModal] = useState({
//     isOpen: false,
//     id: null,
//     senderId: null,
//     username: '',
//     reason: ''
//   });
  
//   const [confirmDeleteReq, setConfirmDeleteReq] = useState({
//     isOpen: false,
//     id: null,
//     username: ''
//   });

//   useEffect(() => {
//     const db = getDatabase();
//     const requestsRef = ref(db, "requests");

//     onValue(requestsRef, async (snapshot) => {
//       const data = snapshot.val();
//       let formattedData = [];

//       if (data) {
//         formattedData = await Promise.all(
//           Object.keys(data).map(async (key) => {
//             const raw = data[key];
//             const request = { id: key, ...raw, status: raw.status || "pending" };

//             try {
//               const userSnap = await get(ref(db, `users/${request.senderId}`));
//               const userData = userSnap.val();
//               if (userData) {
//                 request.username = userData.username;
//                 request.userAvatar = userData.avatarUrl;
//                 request.role = userData.role;
//               }
//             } catch (err) {
//               console.warn("Не удалось загрузить профиль отправителя:", err);
//             }

//             if (request.status === "pending" && request.role === "dean") {
//               await update(ref(db, `requests/${key}`), { status: "accepted" });
//               request.status = "accepted";
//             }

//             return request;
//           })
//         );

//         formattedData = formattedData.filter(
//           (req) => req.role === "teacher" || (typeof req.fio === "string" && req.fio.trim() !== "")
//         );
//       }

//       setRequests(formattedData);
//       setNewRequestsCount(formattedData.filter((r) => r.status === "pending").length);
//     });
//   }, []);

//   const rejectRequest = async (requestId, senderId, reason) => {
//     const db = getDatabase();
//     await update(ref(db, `requests/${requestId}`), { status: "rejected" });
//     await update(ref(db, `users/${senderId}`), { identificationStatus: "rejected" });

//     const notification = {
//       type: "identification_rejected",
//       message: reason,
//       timestamp: new Date().toISOString(),
//     };
//     await push(ref(db, `notifications/${senderId}`), notification);

//     toast.success("Заявка отклонена с уведомлением");
//   };

//   const editRequest = async (requestId) => {
//     const db = getDatabase();
//     await update(ref(db, `requests/${requestId}`), { status: "pending" });
//     toast.info("Заявка возвращена на доработку");
//   };

//   const deleteRequest = async (requestId) => {
//     const db = getDatabase();
//     await remove(ref(db, `requests/${requestId}`));
//     toast.success("Заявка удалена");
//   };

//   const openDeleteReqModal = (id, username) => {
//     setConfirmDeleteReq({ isOpen: true, id, username });
//   };
  
//   const cancelDeleteReq = () => {
//     setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
//   };
  
//   const confirmDeleteReqAction = async () => {
//     const { id } = confirmDeleteReq;
//     if (!id) return;
  
//     try {
//       await deleteRequest(id);
//       setRequests(prev => prev.filter(r => r.id !== id));
//     } catch (err) {
//       console.error(err);
//       toast.error("Ошибка при удалении заявки");
//     }
  
//     setConfirmDeleteReq({ isOpen: false, id: null, username: '' });
//   };
  
//   const handleAcceptRequest = async (requestId) => {
//     const db = getDatabase();
//     const requestRef = ref(db, `requests/${requestId}`);
//     const snapshot = await get(requestRef);
//     const request = snapshot.val();
//     if (!request) return;
  
//     await update(requestRef, { status: "accepted" });
//     await update(ref(db, `users/${request.userId}`), { identificationStatus: "accepted" });
  
//     if (request.course && request.group) {
//       const groupRef = push(ref(db, `groups/${request.course}/${request.group}`));
//       await set(groupRef, {
//         ...request,
//         userAvatar: request.userAvatar || request.photoUrl || defaultAvatar,
//       });
//     }
  
//     toast.success("Заявка принята");
//   };
  
//   const handleEditRequest = async (requestId) => {
//     const db = getDatabase();
//     await update(ref(db, `requests/${requestId}`), { status: "pending" });
//     toast.info("Заявка возвращена для редактирования");
//   };
  
//   const cancelReject = () => {
//     setRejectModal({
//       isOpen: false,
//       id: null,
//       senderId: null,
//       username: '',
//       reason: ''
//     });
//   };
  
//   const confirmRejectSend = async () => {
//     const { id, senderId, reason } = rejectModal;
//     if (!reason.trim()) return;
  
//     const db = getDatabase();
//     await update(ref(db, `requests/${id}`), { status: "rejected" });
//     await update(ref(db, `users/${senderId}`), { identificationStatus: "rejected" });
  
//     await push(ref(db, `notifications/${senderId}`), {
//       type: 'identification_rejected',
//       message: reason,
//       timestamp: new Date().toISOString(),
//     });
  
//     toast.success("Заявка отклонена");
//     cancelReject();
//   };  

//   return {
//     requests,
//     newRequestsCount,
//     handleAcceptRequest,
//     handleEditRequest,
//     confirmRejectSend,
//     cancelReject,
//     acceptRequest,
//     rejectRequest,
//     editRequest,           // ← это внутренняя async-функция
//     deleteRequest,
//     setRequests,
//     setNewRequestsCount,
//     rejectModal,
//     setRejectModal,
//     confirmDeleteReq,
//     setConfirmDeleteReq,
//     openDeleteReqModal,
//     cancelDeleteReq,
//     confirmDeleteReqAction,
//   };  
// };

// export default useRequests;