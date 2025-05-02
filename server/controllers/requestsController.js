const admin = require("firebase-admin");
const db = admin.database();

exports.getAllRequests = async (req, res) => {
  try {
    const snapshot = await db.ref("requests").once("value");
    const data = snapshot.val() || {};
    const formatted = [];

    for (const id in data) {
      const request = { id, ...data[id] };
      const userSnap = await db.ref(`users/${request.senderId}`).once("value");
      const user = userSnap.val();
      if (user) {
        request.username = user.username;
        request.userAvatar = user.avatarUrl;
        request.role = user.role;
      }
      formatted.push(request);
    }

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  const requestId = req.params.id;
  try {
    const reqSnap = await db.ref(`requests/${requestId}`).once("value");
    const request = reqSnap.val();
    if (!request) return res.status(404).json({ error: "Заявка не найдена" });

    await db.ref(`requests/${requestId}`).update({ status: "accepted" });
    await db.ref(`users/${request.userId}`).update({ identificationStatus: "accepted" });

    if (request.course && request.group) {
      await db.ref(`groups/${request.course}/${request.group}`).push({
        ...request,
        userAvatar: request.userAvatar || request.photoUrl || "",
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  const requestId = req.params.id;
  const { senderId, reason } = req.body;

  try {
    await db.ref(`requests/${requestId}`).update({ status: "rejected" });
    await db.ref(`users/${senderId}`).update({ identificationStatus: "rejected" });
    await db.ref(`notifications/${senderId}`).push({
      type: "identification_rejected",
      message: reason,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editRequest = async (req, res) => {
  const requestId = req.params.id;
  try {
    await db.ref(`requests/${requestId}`).update({ status: "pending" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
  const requestId = req.params.id;
  try {
    await db.ref(`requests/${requestId}`).remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};