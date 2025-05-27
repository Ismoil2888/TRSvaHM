const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/usersController");

// GET  /api/users         — вернуть список всех пользователей
router.get("/", ctrl.getAllUsers);
// DELETE  /api/users/:userId — удалить конкретного пользователя
router.delete("/:userId", ctrl.deleteUser);

module.exports = router;