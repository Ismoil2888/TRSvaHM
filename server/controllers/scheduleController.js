const { db } = require("../firebaseAdmin");

exports.getSchedule = async (req, res) => {
  const { course, group } = req.params;
  try {
    const snapshot = await db.ref(`schedules/${course}/${group}`).get();
    res.json(snapshot.exists() ? snapshot.val() : {});
  } catch (err) {
    console.error("🔥 Ошибка при получении расписания:", err);
    res.status(500).json({ error: "Ошибка при получении расписания" });
  }
};

exports.saveSchedule = async (req, res) => {
  const { course, group } = req.params;
  const data = req.body;
  try {
    await db.ref(`schedules/${course}/${group}`).set(data);
    res.json({ success: true });
  } catch (err) {
    console.error("🔥 Ошибка при сохранении расписания:", err);
    res.status(500).json({ error: "Ошибка при сохранении расписания" });
  }
};