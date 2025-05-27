// server/controllers/commentsController.js
const { db } = require("../firebaseAdmin");

// Вспомогательная функция: подгружает username для каждого userId
async function loadUsernames(userIds) {
  const userMap = {};
  await Promise.all(
    Array.from(userIds).map(async (id) => {
      const snap = await db.ref(`users/${id}/username`).once("value");
      userMap[id] = snap.exists() ? snap.val() : "Неизвестен";
    })
  );
  return userMap;
}

// Получить все комментарии к постам вместе с userMap
exports.getPostComments = async (req, res) => {
  try {
    const snap = await db.ref("postComments").once("value");
    const data = snap.val() || {};
    const comments = [];
    const ownerIds = new Set();

    // Собираем комментарии и список анонимных авторов
    for (const [postId, postComments] of Object.entries(data)) {
      for (const [commentId, c] of Object.entries(postComments)) {
        comments.push({ id: commentId, postId, ...c });
        if (c.anonymousOwnerId) ownerIds.add(c.anonymousOwnerId);
      }
    }

    // Подгружаем их имена
    const userMap = await loadUsernames(ownerIds);

    // Сортируем по времени
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Возвращаем и comments, и userMap
    res.json({ comments, userMap });
  } catch (err) {
    console.error("Ошибка получения комментариев к постам:", err);
    res.status(500).json({ error: "Ошибка получения комментариев" });
  }
};

// Удалить комментарий к посту и обновить счётчик
exports.deletePostComment = async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    await db.ref(`postComments/${postId}/${commentId}`).remove();

    // Пересчитаем оставшиеся
    const remSnap = await db.ref(`postComments/${postId}`).once("value");
    const remaining = remSnap.val() || {};
    const count = Object.keys(remaining).length;
    await db.ref(`posts/${postId}`).update({ commentCount: count });

    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка удаления комментария к посту:", err);
    res.status(500).json({ error: "Ошибка удаления комментария" });
  }
};

// Получить отзывы о преподавателях вместе с userMap
exports.getTeacherComments = async (req, res) => {
  try {
    const snap = await db.ref("comments").once("value");
    const data = snap.val() || {};
    const comments = [];
    const ownerIds = new Set();

    // Собираем отзывы и список анонимных авторов
    for (const [teacherId, tchComments] of Object.entries(data)) {
      for (const [commentId, c] of Object.entries(tchComments)) {
        comments.push({ id: commentId, teacherId, ...c });
        if (c.anonymousOwnerId) ownerIds.add(c.anonymousOwnerId);
      }
    }

    // Подгружаем их имена
    const userMap = await loadUsernames(ownerIds);

    // Сортируем по времени
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ comments, userMap });
  } catch (err) {
    console.error("Ошибка получения отзывов преподавателей:", err);
    res.status(500).json({ error: "Ошибка получения отзывов" });
  }
};

// Удалить отзыв преподавателя
exports.deleteTeacherComment = async (req, res) => {
  const { teacherId, commentId } = req.params;
  try {
    await db.ref(`comments/${teacherId}/${commentId}`).remove();
    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка удаления отзыва преподавателя:", err);
    res.status(500).json({ error: "Ошибка удаления отзыва" });
  }
};










// // server/controllers/commentsController.js
// const { db } = require("../firebaseAdmin");

// // Получить все комментарии к постам
// exports.getPostComments = async (req, res) => {
//   try {
//     const snap = await db.ref("postComments").once("value");
//     const data = snap.val() || {};
//     const comments = [];

//     Object.entries(data).forEach(([postId, postComments]) => {
//       Object.entries(postComments).forEach(([commentId, c]) => {
//         comments.push({ id: commentId, postId, ...c });
//       });
//     });

//     comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//     res.json(comments);
//   } catch (err) {
//     console.error("Ошибка получения комментариев к постам:", err);
//     res.status(500).json({ error: "Ошибка получения комментариев" });
//   }
// };

// // Удалить комментарий к посту и обновить счётчик
// exports.deletePostComment = async (req, res) => {
//   const { postId, commentId } = req.params;
//   try {
//     await db.ref(`postComments/${postId}/${commentId}`).remove();

//     const remSnap = await db.ref(`postComments/${postId}`).once("value");
//     const remaining = remSnap.val() || {};
//     const count = Object.keys(remaining).length;

//     await db.ref(`posts/${postId}`).update({ commentCount: count });
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Ошибка удаления комментария к посту:", err);
//     res.status(500).json({ error: "Ошибка удаления комментария" });
//   }
// };

// // Получить отзывы о преподавателях
// exports.getTeacherComments = async (req, res) => {
//   try {
//     const snap = await db.ref("comments").once("value");
//     const data = snap.val() || {};
//     const comments = [];

//     Object.entries(data).forEach(([teacherId, tchComments]) => {
//       Object.entries(tchComments).forEach(([commentId, c]) => {
//         comments.push({ id: commentId, teacherId, ...c });
//       });
//     });

//     comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//     res.json(comments);
//   } catch (err) {
//     console.error("Ошибка получения отзывов преподавателей:", err);
//     res.status(500).json({ error: "Ошибка получения отзывов" });
//   }
// };

// // Удалить отзыв преподавателя
// exports.deleteTeacherComment = async (req, res) => {
//   const { teacherId, commentId } = req.params;
//   try {
//     await db.ref(`comments/${teacherId}/${commentId}`).remove();
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Ошибка удаления отзыва преподавателя:", err);
//     res.status(500).json({ error: "Ошибка удаления отзыва" });
//   }
// };