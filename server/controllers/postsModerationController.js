const { db } = require("../firebaseAdmin");

// Получить все посты со статусом "pending"
exports.getPendingPosts = async (req, res) => {
  try {
    const snap = await db
      .ref("posts")
      .orderByChild("status")
      .equalTo("pending")
      .once("value");

    const data = snap.val() || {};
    const usersSnap = await db.ref("users").once("value");
const users = usersSnap.val()||{};
const posts = Object.entries(data).map(([id, post]) => {
  const u = users[post.userId]||{};
  return {
    id,
    ...post,
    userName: u.username,
    userAvatar: u.avatarUrl
  };
});

    // Сортируем по дате создания (если есть поле createdAt)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(posts);
  } catch (err) {
    console.error("Ошибка получения ожидающих постов:", err);
    res.status(500).json({ error: "Ошибка при загрузке постов" });
  }
};

// Одобрить публикацию
exports.approvePost = async (req, res) => {
  const { postId } = req.params;
  try {
    await db.ref(`posts/${postId}`).update({ status: "approved" });
    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при одобрении публикации:", err);
    res.status(500).json({ error: "Не удалось одобрить пост" });
  }
};

// Отклонить (удалить) публикацию
exports.rejectPost = async (req, res) => {
  const { postId } = req.params;
  try {
    await db.ref(`posts/${postId}`).remove();
    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при отклонении публикации:", err);
    res.status(500).json({ error: "Не удалось отклонить пост" });
  }
};