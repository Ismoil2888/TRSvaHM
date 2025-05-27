import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useComments = () => {
  const [userComments, setUserComments] = useState([]);
  const [teacherComments, setTeacherComments] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [postCommentsCount, setPostCommentsCount] = useState(0);
  const [teacherCommentsCount, setTeacherCommentsCount] = useState(0);

  const fetchPostComments = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE}/api/comments/posts`);
      setUserComments(data.comments);
      setUserMap(data.userMap);
      setPostCommentsCount(data.comments.length);
    } catch {
      toast.error("Ошибка при загрузке комментариев к постам");
    }
  };

  const fetchTeacherComments = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE}/api/comments/teachers`);
      setTeacherComments(data.comments);
      setUserMap(prev => ({ ...prev, ...data.userMap }));
      setTeacherCommentsCount(data.comments.length);
    } catch {
      toast.error("Ошибка при загрузке отзывов об учителях");
    }
  };

  useEffect(() => {
    fetchPostComments();
    fetchTeacherComments();
  }, []);

  return {
    userComments,
    teacherComments,
    userMap,
    postCommentsCount,
    teacherCommentsCount,
    deletePostComment: async (cid, pid) => {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/comments/posts/${pid}/${cid}`);
      setUserComments(c => c.filter(x => x.id !== cid));
      toast.success("Комментарий удалён");
    },
    deleteTeacherComment: async (cid, tid) => {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/comments/teachers/${tid}/${cid}`);
      setTeacherComments(c => c.filter(x => x.id !== cid));
      toast.success("Отзыв удалён");
    },
  };
};

export default useComments;














// // src/hooks/useComments.js
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const useComments = () => {
//   const [userComments, setUserComments] = useState([]);
//   const [teacherComments, setTeacherComments] = useState([]);
//   const [postCommentsCount, setPostCommentsCount] = useState(0);
//   const [teacherCommentsCount, setTeacherCommentsCount] = useState(0);

//   const fetchPostComments = async () => {
//     try {
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/comments/posts`);
//       const comments = Array.isArray(res.data) ? res.data : [];
//       console.log("POST comments from API:", res.data);
//       setUserComments(comments);
//       setPostCommentsCount(comments.length);
//     } catch {
//       toast.error("Ошибка при загрузке комментариев к постам");
//     }
//   };

//   const fetchTeacherComments = async () => {
//     try {
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/comments/teachers`);
//       const comments = Array.isArray(res.data) ? res.data : [];
//       console.log("POST comments from API:", res.data);
//       setTeacherComments(comments);
//       setTeacherCommentsCount(comments.length);
//     } catch {
//       toast.error("Ошибка при загрузке отзывов об учителях");
//     }
//   };

//   const deletePostComment = async (commentId, postId) => {
//     try {
//       await axios.delete(
//         `${process.env.REACT_APP_API_BASE}/api/comments/posts/${postId}/${commentId}`
//       );
//       setUserComments(prev => prev.filter(c => c.id !== commentId));
//       setPostCommentsCount(prev => prev - 1);
//       toast.success("Комментарий удалён");
//     } catch {
//       toast.error("Ошибка при удалении комментария");
//     }
//   };

//   const deleteTeacherComment = async (commentId, teacherId) => {
//     try {
//       await axios.delete(
//         `${process.env.REACT_APP_API_BASE}/api/comments/teachers/${teacherId}/${commentId}`
//       );
//       setTeacherComments(prev => prev.filter(c => c.id !== commentId));
//       setTeacherCommentsCount(prev => prev - 1);
//       toast.success("Отзыв удалён");
//     } catch {
//       toast.error("Ошибка при удалении отзыва");
//     }
//   };

//   useEffect(() => {
//     fetchPostComments();
//     fetchTeacherComments();
//   }, []);

//   return {
//     userComments,
//     teacherComments,
//     postCommentsCount,
//     teacherCommentsCount,
//     deletePostComment,
//     deleteTeacherComment,
//   };
// };

// export default useComments;