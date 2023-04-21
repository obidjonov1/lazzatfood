let followController = module.exports;
const assert = require("assert");
const Definer = require("../lib/mistake");
const Follow = require("../models/Follow");

followController.subscribe = async (req, res) => {
  try {
    console.log("POST cont/subscribe");
    // user login bo'lganligini tekshirilyapti
    assert.ok(req.member, Definer.auth_err5);

    const follow = new Follow();
    await follow.subscribeData(req.member, req.body);

    res.json({ state: "success", data: "Subscribed!" });
  } catch (err) {
    console.log(`ERROR: cont/subscribe ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

followController.unsubscribe = async (req, res) => {
  try {
    console.log("POST cont/unsubscribe");
    // user login bo'lganligini tekshirilyapti
    assert.ok(req.member, Definer.auth_err5);

    const follow = new Follow();
    await follow.unsubscribeData(req.member, req.body);

    res.json({ state: "success", data: "Unsubscribed!" });
  } catch (err) {
    console.log(`ERROR: cont/unsubscribe ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

followController.getMemebrFollowings = async (req, res) => {
  try {
    console.log("POST cont/getMemebrFollowings");
    const follow = new Follow();
    const result = await follow.getMemebrFollowingsData(req.query);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getMemebrFollowings ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};

followController.getMemebrFollowers = async (req, res) => {
  try {
    console.log("POST cont/getMemebrFollowers");

    const follow = new Follow();
    const result = await follow.getMemebrFollowersData(req.member, req.query);

    res.json({ state: "success", data: result });
  } catch (err) {
    console.log(`ERROR: cont/getMemebrFollowers ${err.message}`);
    res.json({ state: "fail", message: err.message });
  }
};
