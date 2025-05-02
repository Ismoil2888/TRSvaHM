const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const multer = require("multer");

// Конфигурация загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Сначала маршруты с фиксированными путями
router.post("/upload", upload.single("photo"), teacherController.uploadPhoto);

// Потом CRUD маршруты с переменными параметрами
router.post("/", teacherController.createTeacher);
router.put("/:id", teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);
router.get("/:id", teacherController.getTeacherById);

module.exports = router;