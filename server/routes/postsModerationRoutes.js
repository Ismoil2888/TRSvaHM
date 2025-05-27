const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/postsModerationController");

// GET  /api/posts/moderation/pending   — список ожидающих постов
router.get("/pending", ctrl.getPendingPosts);

// PUT  /api/posts/moderation/:postId/approve   — одобрить
router.put("/:postId/approve", ctrl.approvePost);

// DELETE  /api/posts/moderation/:postId/reject  — отклонить
router.delete("/:postId/reject", ctrl.rejectPost);

module.exports = router;