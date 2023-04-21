const express = require("express");
const router = express.Router();
const memberController = require("./controllers/memeberController");
const productController = require("./controllers/productController");

/* *************************
 *      REST API          *
 **************************/

// Members secion router
router.post("/signup", memberController.signup);
router.post("/login", memberController.login);
router.get("/logout", memberController.logout);
router.get("/check-me", memberController.checkMyAuthentication);
router.get(
  "/member/:id",
  // 1-si view uchun ->
  memberController.retrieveAuthMember,
  memberController.getChosenMember
);

// Ohters routers
router.post(
  "/products",
  memberController.retrieveAuthMember,
  productController.getAllProducts
);

module.exports = router;
