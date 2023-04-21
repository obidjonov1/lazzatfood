console.log("Web serverni boshlash");
const express = require("express");
const app = express();
const router = require("./router.js");
const router_bssr = require("./router_bssr.js");

let session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
// mongodbga auto store(add) qiladi
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

// 1-> kirish
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2-> session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 6, // for 6 hour
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
app.use("/resto", router_bssr); // ananaviy
app.use("/", router); // React

module.exports = app;
