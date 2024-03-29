const assert = require("assert");
const Definer = require("../lib/mistake");
const Product = require("../models/Product");

let productController = module.exports;

productController.getAllProducts = async (req, res) => {
  try {
    console.log("POST cont/getAllProducts");
    const product = new Product();
    const result = await product.getAllProductsData(req.member, req.body);
    res.json({ state: "success!", data: result });
  } catch (err) {
    console.log(`ERROR, cont/getAllProducts, ${err.message}`);
    res.json({ state: "failed", message: err.message });
  }
};
// 1ta productni view qilish uchun ->
productController.getChosenProduct = async (req, res) => {
  try {
    console.log("GET cont/getChosenProduct");
    const product = new Product(),
      id = req.params.id,
      result = await product.getChosenProductData(req.member, id);

    res.json({ state: "success!", data: result });
  } catch (err) {
    console.log(`ERROR, cont/getChosenProduct, ${err.message}`);
    res.json({ state: "failed", message: err.message });
  }
};

/************************************
 *       BSSR RELATED METHODS       *
 ***********************************/
productController.addNewProduct = async (req, res) => {
  try {
    console.log("POST: cont/addNewProduct");
    // fileni yuklaydi agar file yo'q bo'lsa error qaytaradi ->
    assert(req.files, Definer.general_err3);

    const product = new Product();
    let data = req.body;

    // req.filesga yuklangan fileni array qilib databasega yozish ->
    data.product_images = req.files.map((ele) => {
      // path lardan iborat array hosil qilyabmiz
      // hech qachon databasega img,file yuklamaymiz faqat array yuklaymiz
      return ele.path;
    });

    const result = await product.addNewProductData(data, req.member);

    const html = `<script>
                    alert('new product added successfully');
                    window.location.replace('/resto/products/menu');
                  </script>`;
    res.end(html);
  } catch (err) {
    console.log(`ERROR: cont/addNewProduct ${err.message}`);
  }
};

productController.updateChosenProduct = async (req, res) => {
  try {
    console.log("POST: cont/updateChosenProduct");
    const product = new Product();
    const id = req.params.id;
    const result = await product.updateChosenProductData(
      id,
      req.body,
      req.member._id
    );
    // hammasi aytilganidek(true) bo'lsa javobni qaytarsin ->
    await res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/updateChosenProduct ${err.message}`);
  }
};

// REVIEW
productController.createReview = async (req, res) => {
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

productController.getReviews = async (req, res) => {
  try {
    console.log("GET: cont/getReviews");
    const data = req.query;
    const product = new Product();
    const result = await product.getReviewsData(req.member, data);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getReviews ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

productController.deleteReview = async (req, res) => {
  try {
    console.log("POST: cont/deleteReview");

    const product = new Product();
    const result = await product.deleteReviewData(
      req.member,
      req.body.review_id
    );
    assert.ok(result, Definer.general_err1);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/deleteReview ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};
