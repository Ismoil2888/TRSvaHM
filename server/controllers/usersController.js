const { db, auth } = require("../firebaseAdmin");

exports.getAllUsers = async (req, res) => {
  try {
    const snap = await db.ref("users").once("value");
    const usersData = snap.val() || {};
    const list = Object.entries(usersData).map(([id, u]) => ({
      id,
      username: u.username,
      email: u.email,
      avatarUrl: u.avatarUrl || null,
      role: u.role || null,
      ipAddress: u.ipAddress || null,
      identificationStatus: u.identificationStatus || null,
      // ... любые другие нужные поля
    }));
    res.json(list);
  } catch (err) {
    console.error("Ошибка при загрузке пользователей:", err);
    res.status(500).json({ error: "Не удалось получить пользователей" });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // 1) удаляем из Realtime Database
    await db.ref(`users/${userId}`).remove();
    // 2) удаляем из Authentication
    await auth.deleteUser(userId);

    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
    res.status(500).json({ error: "Не удалось удалить пользователя" });
  }
};