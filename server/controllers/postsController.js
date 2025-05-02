const { db } = require("../firebaseAdmin");

// Получить все посты
exports.getAllPosts = async (req, res) => {
  try {
    const snapshot = await db.ref("posts").once("value");
    const posts = snapshot.val();
    res.json(posts || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Создать новый пост
exports.createPost = async (req, res) => {
  try {
    const newPost = req.body;
    const ref = db.ref("posts").push();
    await ref.set(newPost);
    res.status(201).json({ id: ref.key, ...newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};