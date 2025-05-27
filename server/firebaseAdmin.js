require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./firebase/serviceAccountKey.json");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.STORAGE_BUCKET,
      databaseURL: process.env.FIREBASE_DATABASE_URL,  // лучше брать из .env
    });
    console.log("Firebase Admin инициализирован успешно!");
  } catch (error) {
    console.error("Ошибка инициализации Firebase Admin:", error);
    process.exit(1);
  }
}

const db = admin.database();
const bucket = admin.storage().bucket();
const auth = admin.auth();               // <-- добавили
console.log("Bucket:", bucket.name);

module.exports = { admin, db, bucket, auth };







// require("dotenv").config();
// const admin = require("firebase-admin");
// const serviceAccount = require("./firebase/serviceAccountKey.json");

// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//       storageBucket: process.env.STORAGE_BUCKET,
//       databaseURL: "https://university-app-ff9e7-default-rtdb.firebaseio.com"
//     });
//     console.log("Firebase Admin инициализирован успешно!");
//   } catch (error) {
//     console.error("Ошибка инициализации Firebase Admin:", error);
//     process.exit(1);
//   }
// }

// const db = admin.database();
// const bucket = admin.storage().bucket();
// console.log("Bucket:", bucket.name);

// module.exports = { admin, db, bucket };