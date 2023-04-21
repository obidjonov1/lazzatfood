const express = require("express");
const router_bssr = express.Router();
const marketController = require("./controllers/marketController");
const productController = require("./controllers/productController");
const uploader_product = require("./utils/upload-multer")("products");
const uploader_members = require("./utils/upload-multer")("members");
/* *************************
 *      BSSR EJS          *
 **************************/

router_bssr.get("/", marketController.home);

router_bssr
  .get("/sign-up", marketController.getSignupMyMarket)
  .post(
    "/sign-up",
    uploader_members.single("market_img"),
    marketController.signupProcess
  );

router_bssr
  .get("/login", marketController.getLoginMyMarket)
  .post("/login", marketController.loginProcess);

router_bssr.get("/logout", marketController.logout);
router_bssr.get("/check-me", marketController.checkSessions);

router_bssr.get("/products/menu", marketController.getMyMarketProducts);
router_bssr.post(
  "/products/create",
  // Serverga image yuklash
  marketController.validateAuthMarket,
  uploader_product.array("product_images", 5),
  productController.addNewProduct
);
router_bssr.post(
  "/products/edit/:id",
  marketController.validateAuthMarket,
  productController.updateChosenProduct
);

router_bssr.get(
  "/all-market",
  marketController.validateAdmin,
  marketController.getAllMarkets
);

router_bssr.post(
  "/all-market/edit",
  marketController.validateAdmin,
  marketController.updateMarketByAdmin
);

module.exports = router_bssr;
