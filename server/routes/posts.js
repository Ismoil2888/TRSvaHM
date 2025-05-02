const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// Маршруты
router.get("/", postsController.getAllPosts);
router.post("/", postsController.createPost);

module.exports = router;