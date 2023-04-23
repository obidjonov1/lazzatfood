let communityController = module.exports;
const assert = require("assert");
const Definer = require("../lib/mistake");
const Community = require("../models/Community");
const Product = require("../models/Product");

communityController.imageInsertion = async (req, res) => {
  try {
    console.log("POST: cont/imageInsertion");
    // reqni ichida file borligin tekshirilyapti ->
    assert.ok(req.file, Definer.general_err3);
    const image_url = req.file.path;

    res.json({ state: "success", data: image_url });
  } catch (err) {
    console.log(`ERROR: cont/imageInsertion ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

communityController.createArticle = async (req, res) => {
  try {
    console.log("POST: cont/createArticle");

    const community = new Community();
    const result = await community.createArticleData(req.member, req.body);
    assert.ok(result, Definer.general_err1);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/createArticle ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

communityController.getMemberArticles = async (req, res) => {
  try {
    console.log("GET: cont/getMemberArticles");
    const community = new Community();

    /*  req.query.mb_id != "none" ga (boshqani ko'rsatadi), agar "none" ga = bo'lsa (myArticles)ni ko'rsatadi,
      agar umuman yo'q bo'sa ERROR[42] */
    const mb_id = req.query.mb_id !== "none" ? req.query.mb_id : req.member._id;
    assert.ok(mb_id, Definer.article_err1);

    const result = await community.getMemberArticlesData(
      req.member,
      mb_id,
      req.query
    );

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getMemberArticles ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

communityController.getArticles = async (req, res) => {
  try {
    console.log("GET: cont/getArticles");
    const community = new Community();
    const result = await community.getArticlesData(req.member, req.query);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getArticles ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

communityController.getChosenArticle = async (req, res) => {
  try {
    console.log("GET: cont/getChosenArticle");
    const art_id = req.params.art_id,
      community = new Community(),
      result = await community.getChosenArticleData(req.member, art_id);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getChosenArticle ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

// REVIEW
communityController.createReview = async (req, res) => {
  try {
    console.log("POST: cont/createReview");

    const product = new Product();
    const result = await product.createReviewData(req.member, req.body);
    assert.ok(result, Definer.general_err1);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/createReview ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

// communityController.createReview = async (req, res) => {
//   try {
//     console.log("POST: cont/createReview");

//     const community = new Community();
//     const result = await community.createReviewData(req.member, req.body);
//     assert.ok(result, Definer.general_err1);

//     res.json({ state: "success", data: result });
//   } catch (err) {
//     console.log(`ERROR: cont/createReview ${err.message}`);
//     res.json({ state: "fail", message: err.message });
//   }
// };