console.log("Web serverni boshlash");
const http = require("http");
const express = require("express");
const app = express();
const router = require("./router.js");
const router_bssr = require("./router_bssr.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");

let session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
// mongodbga auto store(add) qiladi
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

// 1-> kirish
app.use(express.static("public"));
// frontendga imglarni ochib berish "__dirname-routing" "uploads"dan rasimni olishga ruhsat beradi ->
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: true, // <- har qanday domandan reqga ruhsat beradi
  })
);
// cookiega set bo'lgan tokenni ACTIVE qilish(memberController.js[36]) ->
app.use(cookieParser());

// 2-> session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 6, // for 6 hours
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(function (req, res, next) {
  // bizning browserning localiga memberni qo'yib beradi
  res.locals.member = req.session.member;
  next();
});

// 3 -> view code
app.set("views", "views");
app.set("view engine", "ejs");

// 4 -> routing code
app.use("/resto", router_bssr); // ananaviy MODERN
app.use("/", router); // React (REST API) single page

const server = http.createServer(app);

/* SOCKET.IO BACKEND SERVER */
const io = require("socket.io")(server, {
  serveClient: false,
  origins: "*:*", // hammaga ochiq bo'lishi uchun
  transport: ["Websocket", "xhr-polling"],
});

// serverga user ulansa 1-shu yerga keladi
let online_users = 0;
io.on("connection", function (socket) {
  online_users++;
  console.log("New user,  total:", online_users);
  socket.emit("greetMsg", { text: "Welcome" });
  io.emit("infoMsg", { total: online_users });

  socket.on("disconnect", function () {
    online_users--;
    socket.broadcast.emit("infoMsg", { total: online_users });
    console.log("Client disconneted, total:", online_users);
  });

  socket.on("createMsg", function (data) {
    console.log(data);
    io.emit("newMsg", data);
  });

  /* 
  socket.emit(); --> ulangan userni o'zigagina boradigan habar
  socket.broadcast.emit(); --> connection bo'lgan userdan boshqalarga  boradigan habar(connection_user 빼고)
  io.emit(); --> hammaga boradigan habar 
  */
});

module.exports = server;
