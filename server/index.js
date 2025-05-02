require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { admin, bucket } = require("./firebaseAdmin"); 

const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "https://ictttu.com",        // клиент (PWA)
    "https://www.ictttu.com",    // на всякий случай
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // разрешаем запросы без origin (например, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS запрещён для этого источника: " + origin));
      }
    },
    credentials: true,
  }));
  

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🔥 API работает");
});

const postsRoutes = require("./routes/posts");
app.use("/posts", postsRoutes);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const teacherRoutes = require("./routes/teachers");
app.use("/api/teachers", teacherRoutes);

const requestsRoutes = require("./routes/requestsRoutes");
app.use("/api/requests", requestsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});








// require("dotenv").config({ path: __dirname + "/.env" });
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { admin, bucket } = require("./firebaseAdmin"); 

// const app = express();
// app.use(cors({
//     origin: "http://localhost:3000", // ← Разрешаем запросы с React
//     credentials: true
//   }));

// app.use(bodyParser.json());

// app.get("/", (req, res) => {
//   res.send("🔥 API работает");
// });

// const postsRoutes = require("./routes/posts");
// app.use("/posts", postsRoutes);

// const authRoutes = require("./routes/auth");
// app.use("/auth", authRoutes);

// const teacherRoutes = require("./routes/teachers");
// app.use("/api/teachers", teacherRoutes);

// const requestsRoutes = require("./routes/requestsRoutes");
// app.use("/api/requests", requestsRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Сервер запущен на порту ${PORT}`);
// });