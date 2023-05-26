const BoArticleModel = require("../schema/bo_article.model");
const BoReviewModel = require("../schema/review.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const {
  shapeIntoMongooseObjectId,
  board_id_enum_list,
  lookup_auth_member_liked,
} = require("../lib/config");
const Member = require("./Member");

class Community {
  constructor() {
    this.boArticleModel = BoArticleModel;
    this.boReviewModel = BoReviewModel;
  }
  async createArticleData(member, data) {
    try {
      // datani ichiga mb_id ni pass qilinyapti ->
      data.mb_id = shapeIntoMongooseObjectId(member._id);
      const new_article = await this.saveArticleData(data);
      return new_article;
    } catch (err) {
      throw err;
    }
  }

  async saveArticleData(data) {
    try {
      const article = new this.boArticleModel(data);
      return await article.save();
    } catch (mongo_err) {
      console.log(mongo_err);
      throw new Error(Definer.mongo_validation_err1);
    }
  }

  async getMemberArticlesData(member, mb_id, inquiry) {
    try {
      const auth_mb_id = shapeIntoMongooseObjectId(member?._id);
      mb_id = shapeIntoMongooseObjectId(mb_id);
      const page = inquiry["page"] ? inquiry["page"] * 1 : 1;
      const limit = inquiry["limit"] ? inquiry["limit"] * 1 : 5;

      const result = await this.boArticleModel
        .aggregate([
          { $match: { mb_id: mb_id, art_status: "active" } },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: "members",
              localField: "mb_id",
              foreignField: "_id",
              as: "member_data",
            },
          },
          // arraysiz yozish yani arrayni ichidan chiqarib yuborish ->
          // faqat 1ta objectni ichidagi objectni olib "member_data" ga qo'yob ber ->
          { $unwind: "$member_data" },
          // auth member ko'rayotgan itemiga like bosganligini check qilish ->
          lookup_auth_member_liked(auth_mb_id),
        ])
        .exec();
      assert.ok(result, Definer.article_err2);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getArticlesData(member, inquiry) {
    try {
      const auth_mb_id = shapeIntoMongooseObjectId(member?.id);
      let matches =
        inquiry.bo_id === "all"
          ? { bo_id: { $in: board_id_enum_list }, art_status: "active" }
          : { bo_id: inquiry.bo_id, art_status: "active" };
      inquiry.limit *= 1;
      inquiry.page *= 1;

      const sort = inquiry.order
        ? { [`${inquiry.order}`]: -1 }
        : { createdAt: -1 };

      const result = await this.boArticleModel
        .aggregate([
          { $match: matches },
          { $sort: sort },
          { $skip: (inquiry.page - 1) * inquiry.limit },
          { $limit: inquiry.limit },
          {
            $lookup: {
              from: "members",
              localField: "mb_id",
              foreignField: "_id",
              as: "member_data",
            },
          },
          // arraysiz yozish yani arrayni ichidan chiqarib yuborish ->
          // faqat 1ta objectni ichidagi objectni olib "member_data" ga qo'yob ber ->
          { $unwind: "$member_data" },
          // auth member ko'rayotgan itemiga like bosganligini check qilish ->
          lookup_auth_member_liked(auth_mb_id),
        ])
        .exec();

      assert.ok(result, Definer.article_err3);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getChosenArticleData(member, art_id) {
    try {
      art_id = shapeIntoMongooseObjectId(art_id);

      if (member) {
        const member_obj = new Member();
        await member_obj.viewChosenItemByMember(member, art_id, "community");
      }

      const result = await this.boArticleModel.findById({ _id: art_id }).exec();
      assert.ok(result, Definer.article_err3);

      return result;
    } catch (err) {
      throw err;
    }
  }

  /* Review */
  async createReviewData(user, data) {
    try {
      data.user_id = shapeIntoMongooseObjectId(user._id);
      const new_review = await this.saveReviewData(data);
      return new_review;
    } catch (err) {
      throw err;
    }
  }

  async saveReviewData(data) {
    try {
      const review = new this.boReviewModel(data);
      return await review.save();
    } catch (mongo_err) {
      console.log(mongo_err);
      throw new Error(Definer.mongo_validation_err1);
    }
  }

  async deleteReviewData(user, review_id) {
    try {
      const deleted_review = await this.boReviewModel.deleteOne({
        _id: shapeIntoMongooseObjectId(review_id),
        user_id: shapeIntoMongooseObjectId(user._id),
      });
      return deleted_review.deletedCount;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Community;
