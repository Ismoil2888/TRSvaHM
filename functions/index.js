const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.getEmailByUsername = functions.https.onCall(async (data, context) => {
  const username = data.username;

  if (!username) {
    throw new functions.https.HttpsError("invalid-argument", "Username is required");
  }

  try {
    const usersRef = admin.database().ref("users");
    const snapshot = await usersRef.orderByChild("username").equalTo(username).once("value");

    if (!snapshot.exists()) {
      throw new functions.https.HttpsError("not-found", "Username not found");
    }

    const userData = snapshot.val();
    const userId = Object.keys(userData)[0];
    const email = userData[userId].email;

    return {email};
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Error retrieving email");
  }
});