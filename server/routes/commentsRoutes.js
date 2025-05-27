const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

// Получить все комментарии к постам
router.get("/posts", commentsController.getPostComments);
// Удалить комментарий к посту
router.delete("/posts/:postId/:commentId", commentsController.deletePostComment);

// Получить все отзывы об учителях
router.get("/teachers", commentsController.getTeacherComments);
// Удалить отзыв об учителе
router.delete("/teachers/:teacherId/:commentId", commentsController.deleteTeacherComment);

module.exports = router;