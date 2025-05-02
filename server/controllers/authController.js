const { admin, db } = require("../firebaseAdmin");

exports.signup = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password
    });

    await db.ref("users/" + userRecord.uid).set({
      username,
      email
    });

    res.status(201).json({ uid: userRecord.uid, username });
  } catch (error) {
    console.error(error);
    let msg = "Произошла ошибка";

    if (error.code === "auth/email-already-exists") {
      msg = "Email уже используется";
    } else if (error.code === "auth/invalid-email") {
      msg = "Неверный формат email";
    } else if (error.code === "auth/weak-password") {
      msg = "Слабый пароль";
    }

    res.status(400).json({ error: msg });
  }
};


exports.adminLogin = (req, res) => {
  const { password } = req.body;

//   console.log("ADMIN_PASSWORD =", process.env.ADMIN_PASSWORD);
// console.log("Введённый пароль =", password);

  if (password === process.env.ADMIN_PASSWORD) {
    // Успешно — можно выдать флаг или токен
    return res.json({ success: true });
  } else {
    return res.status(401).json({ error: "Неверный пароль" });
  }
};