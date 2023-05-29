const express = require("express");
const router = express.Router();
const memberController = require("./controllers/memeberController");
const productController = require("./controllers/productController");
const marketController = require("./controllers/marketController");
const orderController = require("./controllers/orderController");
const followController = require("./controllers/followController");
const communityController = require("./controllers/communityController");
const uploader_community = require("./utils/upload-multer")("community");
const uploader_member = require("./utils/upload-multer")("members");

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
router.post(
  "/member-liken",
  memberController.retrieveAuthMember,
  memberController.likeMemberChosen
);
router.post(
  "/member/update",
  memberController.retrieveAuthMember,
  uploader_member.single("mb_image"),
  memberController.updateMember
);

// Product related routers
router.post(
  "/products",
  memberController.retrieveAuthMember, // middleveartoken
  productController.getAllProducts
);
router.get(
  "/products/:id",
  memberController.retrieveAuthMember,
  productController.getChosenProduct
);
router.post(
  "/create-review",
  memberController.retrieveAuthMember,
  productController.createReview
);
router.get(
  "/reviews",
  memberController.retrieveAuthMember,
  productController.getReviews
);
router.post(
  "/delete-review",
  memberController.retrieveAuthMember,
  productController.deleteReview
);

// Market related routers
router.get(
  "/markets",
  memberController.retrieveAuthMember,
  marketController.getMarkets
);

router.get(
  "/markets/:id",
  memberController.retrieveAuthMember,
  marketController.getChosenMarket
);

// Order related routers
router.post(
  "/orders/create",
  memberController.retrieveAuthMember,
  orderController.createOrder
);
router.get(
  "/orders",
  memberController.retrieveAuthMember,
  orderController.getMyOrders
);
router.post(
  "/orders/edit",
  memberController.retrieveAuthMember,
  orderController.editChosenOrder
);

// Community related routers
router.post(
  "/community/image",
  uploader_community.single("community_image"),
  communityController.imageInsertion
);
router.post(
  "/community/create",
  memberController.retrieveAuthMember,
  communityController.createArticle
);
router.get(
  "/community/articles",
  memberController.retrieveAuthMember,
  communityController.getMemberArticles
);
router.get(
  "/community/target",
  memberController.retrieveAuthMember,
  communityController.getArticles
);
router.get(
  "/community/single-article/:art_id",
  memberController.retrieveAuthMember,
  communityController.getChosenArticle
);

// Following related routers
router.post(
  "/follow/subscribe",
  memberController.retrieveAuthMember,
  followController.subscribe
);
router.post(
  "/follow/unsubscribe",
  memberController.retrieveAuthMember,
  followController.unsubscribe
);
router.get("/follow/followings", followController.getMemebrFollowings);
router.get(
  "/follow/followers",
  memberController.retrieveAuthMember,
  followController.getMemebrFollowers
);

module.exports = router;
