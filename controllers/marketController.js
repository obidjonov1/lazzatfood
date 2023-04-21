const assert = require("assert");
const Definer = require("../lib/mistake");
const Member = require("../models/Member");
const Product = require("../models/Product");
const Market = require("../models/Market");

let marketController = module.exports;

marketController.getMarkets = async (req, res) => {
  try {
    console.log("GET: cont/getMarkets");
    const data = req.query,
      market = new Market(),
      result = await market.getMarketsData(req.member, data);
    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getMarkets, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.getChosenMarket = async (req, res) => {
  try {
    console.log("GET: cont/getChosenMarket");
    const id = req.params.id,
      market = new Market(),
      result = await market.getChosenMarketData(req.member, id);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getChosenMarket, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

/************************************
 *       BSSR RELATED METHODS       *
 ***********************************/

marketController.home = (req, res) => {
  try {
    console.log("GET: cont/home");
    res.render("home-page");
  } catch (err) {
    console.log(`ERROR: cont/home, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.getMyMarketProducts = async (req, res) => {
  try {
    console.log("GET: cont/getMyMarketProducts");
    const product = new Product();
    const data = await product.getAllProductsDataResto(res.locals.member);
    // login bo'lgan marketni hamma productlarini olib "market-menu.ejs" ga yuboradi
    res.render("market-menu", { market_data: data });
  } catch (err) {
    console.log(`ERROR: cont/getMyMarketProducts ${err.message}`);
    res.redirect("/resto");
  }
};

marketController.getSignupMyMarket = async (req, res) => {
  try {
    console.log("GET: cont/getSignupMyMarket");
    res.render("signup");
  } catch (err) {
    console.log(`ERROR: cont/getSignupMyMarket ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.signupProcess = async (req, res) => {
  try {
    console.log("POST: cont/signupProcess");
    assert(req.file, Definer.general_err3);

    let new_member = req.body;
    new_member.mb_type = "MARKET";
    // yuklangan image ->
    new_member.mb_image = req.file.path;

    const member = new Member(),
      // signupData(data) -> ga req.bodyni yuboryabmiz
      result = await member.signupData(new_member);
    assert(req.file, Definer.general_err1);

    // resquest sessionni ichiga SET qilyabmiz
    req.session.member = result;
    res.redirect("/resto/products/menu"); // boshqa pagega yuborish
  } catch (err) {
    console.log(`ERROR: cont/signupProcess ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.getLoginMyMarket = async (req, res) => {
  try {
    console.log("GET: cont/getLoginMyMarket");
    res.render("login-page");
  } catch (err) {
    console.log(`ERROR: cont/getLoginMyMarket ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.loginProcess = async (req, res) => {
  try {
    console.log("POST: cont/loginProcess");
    const data = req.body,
      member = new Member(),
      // signupData(data) -> ga req.bodyni yuboryabmiz
      result = await member.loginData(data); // memberimizni barcha ma'lumotlari "result" da mavjud

    // sessionni ichida memberni hosil qilib ichiga yuklayabmiz "result"ni
    req.session.member = result;
    req.session.save(function () {
      // redirect = bu router_bssr.js(23) dan davom etadi
      result.mb_type === "ADMIN"
        ? res.redirect("/resto/all-market")
        : res.redirect("/resto/products/menu");
    });
  } catch (err) {
    console.log(`ERROR: cont/loginProcess ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.logout = (req, res) => {
  try {
    console.log("GET cont/logout");
    // destroy() sessionni delete qiladi va "home" ga yuboradi
    req.session.destroy(function () {
      res.redirect("/resto");
    });
  } catch (err) {
    console.log(`ERROR: cont/loginProcess ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.validateAuthMarket = (req, res, next) => {
  if (req.session?.member?.mb_type === "MARKET") {
    req.member = req.session.member;
    next();
  } else
    res.json({
      state: "fail",
      message: "Only authenticated members with market type",
    });
};

marketController.checkSessions = (req, res) => {
  if (req.session.member) {
    res.json({ state: "success", data: req.session.member });
  } else {
    res.json({ state: "fail", message: "You are not authenticated" });
  }
};

marketController.validateAdmin = (req, res, next) => {
  if (req.session?.member?.mb_type === "ADMIN") {
    req.member = req.session.member;
    next();
  } else {
    const html = `<script>
                    alert("Admin page: Permisson denied!");
                    window.location.replace('/resto');
                  </script>`;
    res.end(html);
  }
};

marketController.getAllMarkets = async (req, res) => {
  try {
    console.log("GET cont/getAllMarkets");

    const market = new Market();
    const markets_data = await market.getAllMarketsData();
    // type = "MARKET" hammasini all-markets.ejsga chiqarib beradi
    res.render("all-markets", { markets_data: markets_data });
  } catch (err) {
    console.log(`ERROR: cont/getAllMarkets, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

marketController.updateMarketByAdmin = async (req, res) => {
  try {
    console.log("GET cont/updateMarketByAdmin");
    const market = new Market();
    const result = await market.updateMarketByAdminData(req.body);
    // update bo'lgan qiymatni res.jsonga path qilyabmiz ->
    await res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/updateMarketByAdmin, ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};
