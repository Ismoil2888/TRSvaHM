const { ref, push, set, update, remove, get } = require("firebase/database");
const { bucket, db } = require("../firebaseAdmin");

// Загрузка фото преподавателя
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Файл не найден" });

    const fileName = `teachers/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    res.json({ url });
  } catch (error) {
    console.error("Ошибка при загрузке фото:", error);
    res.status(500).json({ error: "Ошибка при загрузке фото" });
  }
};

// Создание преподавателя
exports.createTeacher = async (req, res) => {
  try {
    const data = req.body;
    const newRef = push(ref(db, "teachers"));
    await set(newRef, data);
    res.status(201).json({ id: newRef.key });
  } catch (error) {
    console.error("Ошибка при создании преподавателя:", error);
    res.status(500).json({ error: "Ошибка при создании преподавателя" });
  }
};

// ✅ Обновление преподавателя
exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    await update(ref(db, `teachers/${id}`), data);
    res.status(200).json({ message: "Преподаватель обновлён" });
  } catch (error) {
    console.error("Ошибка при обновлении преподавателя:", error);
    res.status(500).json({ error: "Ошибка при обновлении преподавателя" });
  }
};

// ✅ Удаление преподавателя
exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    await remove(ref(db, `teachers/${id}`));
    res.status(200).json({ message: "Преподаватель удалён" });
  } catch (error) {
    console.error("Ошибка при удалении преподавателя:", error);
    res.status(500).json({ error: "Ошибка при удалении преподавателя" });
  }
};

// ✅ Получить преподавателя по ID
exports.getTeacherById = async (req, res) => {
  try {
    const id = req.params.id;
    const snapshot = await get(ref(db, `teachers/${id}`));

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Преподаватель не найден" });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    console.error("Ошибка при получении преподавателя:", error);
    res.status(500).json({ error: "Ошибка при получении преподавателя" });
  }
};

// Получение всех преподавателей
exports.getAllTeachers = async (req, res) => {
  try {
    const snapshot = await get(ref(db, "teachers"));
    if (!snapshot.exists()) return res.json([]);

    const data = snapshot.val();
    const teachers = Object.entries(data).map(([id, teacher]) => ({
      id,
      ...teacher,
    }));
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Ошибка при получении преподавателей:", error);
    res.status(500).json({ error: "Ошибка при получении преподавателей" });
  }
};