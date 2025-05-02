const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");
const { getDatabase } = require("firebase-admin/database");

// Новый GET-запрос со сложной логикой
router.get("/", async (req, res) => {
  try {
    const db = getDatabase();
    const requestsSnap = await db.ref("requests").once("value");
    const requestsData = requestsSnap.val() || {};

    const usersSnap = await db.ref("users").once("value");
    const usersData = usersSnap.val() || {};

    const formatted = [];

    for (const [key, value] of Object.entries(requestsData)) {
      const user = usersData[value.senderId];
      if (!user) continue;

      const enriched = {
        id: key,
        ...value,
        username: user.username,
        userAvatar: user.avatarUrl,
        role: user.role,
      };

      if (enriched.status === "pending" && enriched.role === "dean") {
        await db.ref(`requests/${key}`).update({ status: "accepted" });
        enriched.status = "accepted";
      }

      if (
        enriched.role === "teacher" ||
        (enriched.fio && enriched.fio.trim() !== "")
      ) {
        formatted.push(enriched);
      }
    }

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения заявок" });
  }
});

// Остальные маршруты — оставляем как есть
router.post("/:id/accept", requestsController.acceptRequest);
router.post("/:id/reject", requestsController.rejectRequest);
router.post("/:id/edit", requestsController.editRequest);
router.delete("/:id", requestsController.deleteRequest);

module.exports = router;








// const express = require("express");
// const router = express.Router();
// const requestsController = require("../controllers/requestsController");

// router.get("/", requestsController.getAllRequests);
// router.post("/:id/accept", requestsController.acceptRequest);
// router.post("/:id/reject", requestsController.rejectRequest);
// router.post("/:id/edit", requestsController.editRequest);
// router.delete("/:id", requestsController.deleteRequest);

// module.exports = router;