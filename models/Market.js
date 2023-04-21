const assert = require("assert");
const { model } = require("mongoose");
const {
  shapeIntoMongooseObjectId,
  lookup_auth_member_liked,
} = require("../lib/config");
const Definer = require("../lib/mistake");
const MemberModel = require("../schema/member.model");
const Member = require("./Member");

class Market {
  constructor() {
    this.memberModel = MemberModel;
  }

  async getMarketsData(member, data) {
    try {
      const auth_mb_id = shapeIntoMongooseObjectId(member?._id);
      // searching
      let match = { mb_type: "MARKET", mb_status: "ACTIVE" };
      let aggregationQuery = []; // aggregateni ichidagi "query"ga PASS qilish uchun
      data.limit = data["limit"] * 1; // stringni -> numberga =
      data.page = data["page"] * 1; // stringni -> numberga =

      switch (data.order) {
        case "top":
          match["mb_top"] = "Y";
          aggregationQuery.push({ $match: match });
          aggregationQuery.push({ $sample: { size: data.limit } }); // 4ta market limit
          break;
        case "random":
          aggregationQuery.push({ $match: match });
          aggregationQuery.push({ $sample: { size: data.limit } });
          break;
        default: // [data.order] qiymatni olib beradi va objni elementiga =lashtiradi
          aggregationQuery.push({ $match: match });
          const sort = { [data.order]: -1 };
          aggregationQuery.push({ $sort: sort });
          break;
      }

      aggregationQuery.push({ $skip: (data.page - 1) * data.limit }); // 1-8 pagelarni skip qilib beradi
      aggregationQuery.push({ $limit: data.limit });
      // auth member ko'rayotgan itemiga like bosganligini check qilish ->
      aggregationQuery.push(lookup_auth_member_liked(auth_mb_id));

      const result = await this.memberModel.aggregate(aggregationQuery).exec();
      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getChosenMarketData(member, id) {
    try {
      // memberSchema modelni ichida "query" qilyotganda ishlatamiz ->
      id = shapeIntoMongooseObjectId(id);

      // login bo'lmagan bo'lsa bu yerdan o'tib ketadi -->
      // 1ta productni viewlarni '1+view' qilish ->
      if (member) {
        const member_obj = new Member();
        await member_obj.viewChosenItemByMember(member, id, "member");
      }

      const result = await this.memberModel
        .findOne({
          _id: id,
          mb_status: "ACTIVE",
        })
        .exec();

      assert.ok(result, Definer.general_err2);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getAllMarketsData() {
    try {
      let result = await this.memberModel
        .find({
          mb_type: "MARKET",
        })
        .exec();

      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateMarketByAdminData(update_data) {
    try {
      const id = shapeIntoMongooseObjectId(update_data?.id);
      const result = await this.memberModel
        .findByIdAndUpdate(
          { _id: id },
          update_data,
          // update bo'lgan qiymatni qaytaradi
          { runValidators: true, lean: true, returnDocument: "after" }
        )
        .exec();

      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Market;
