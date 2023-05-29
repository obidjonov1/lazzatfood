const assert = require("assert");
const {
  shapeIntoMongooseObjectId,
  lookup_auth_member_liked,
  lookup_blog_reviews,
} = require("../lib/config");
const Definer = require("../lib/mistake");
const ProductModel = require("../schema/product.model");
const ReviewModel = require("../schema/review.model");
const Member = require("./Member");

class Product {
  constructor() {
    this.productModel = ProductModel;
    this.reviewModel = ReviewModel;
  }

  async getAllProductsData(member, data) {
    try {
      const auth_mb_id = shapeIntoMongooseObjectId(member?._id);
      let match = {
        product_status: "PROCESS",
      };

      if (data.product_collection) {
        match.product_collection = data.product_collection;
      }

      if (data.market_mb_id) {
        match.market_mb_id = shapeIntoMongooseObjectId(data.market_mb_id);
      }

      const sort =
        data.order === "product_price"
          ? { [data.order]: 1 }
          : { [data.order]: -1 }; //dynamic value

      const result = await this.productModel
        .aggregate([
          { $match: match },
          { $sort: sort },
          { $skip: (data.page * 1 - 1) * data.limit },
          { $limit: data.limit * 1 },
          {
            $lookup: {
              from: "members",
              localField: "market_mb_id",
              foreignField: "_id",
              as: "member_data",
            },
          },
          // auth member ko'rayotgan itemiga like bosganligini check qilish ->
          lookup_auth_member_liked(auth_mb_id),
          lookup_blog_reviews(),
        ])
        .exec();

      // console.log("result:", result);

      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getChosenProductData(member, id) {
    try {
      const auth_mb_id = shapeIntoMongooseObjectId(member?._id);
      id = shapeIntoMongooseObjectId(id);

      // login bo'lmagan bo'lsa bu yerdan o'tib ketadi -->
      // 1ta productni viewlarni '1+view' qilish ->
      if (member) {
        const member_obj = new Member();
        await member_obj.viewChosenItemByMember(member, id, "product");
      }

      const result = await this.productModel
        // productlarning statusi "PROCESS" bo'lsa shularni olib ber ->
        .aggregate([
          { $match: { _id: id, product_status: "PROCESS" } },
          // auth member ko'rayotgan itemiga like bosganligini check qilish ->
          lookup_auth_member_liked(auth_mb_id),
          lookup_blog_reviews(),
        ])
        .exec();

      assert.ok(result, Definer.general_err1);
      return result[0];
    } catch (err) {
      throw err;
    }
  }

  async getAllProductsDataResto(member) {
    try {
      // login bo'lgan memberning idsi orqali productModuldan -> [16] ->
      member._id = shapeIntoMongooseObjectId(member._id);
      const result = await this.productModel.find({
        // market_mb_id = member._id bo'lgan hammasini topib beradi -> [20]
        market_mb_id: member._id,
      });
      assert.ok(result, Definer.general_err1);
      // [17]-> va ularni qaytarib beradi
      return result; // marketController [21] ga pass qilib beradi
    } catch (err) {
      throw err;
    }
  }

  async addNewProductData(data, member) {
    try {
      data.market_mb_id = shapeIntoMongooseObjectId(member._id);

      const new_product = this.productModel(data);
      const result = await new_product.save();

      assert.ok(result, Definer.product_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateChosenProductData(id, updated_data, mb_id) {
    try {
      id = shapeIntoMongooseObjectId(id);
      mb_id = shapeIntoMongooseObjectId(mb_id);

      const result = await this.productModel
        .findOneAndUpdate(
          // qaysi objectni update qilinyapti ->
          { _id: id, market_mb_id: mb_id },
          updated_data,
          // o'zgargan datani yuboradi ->
          {
            runValidators: true,
            lean: true,
            returnDocument: "after",
          }
        )
        .exec();

      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  /* Review */
  async createReviewData(member, data) {
    try {
      data.mb_id = shapeIntoMongooseObjectId(member._id);
      data._id = shapeIntoMongooseObjectId(data._id);
      const result = await this.saveReviewData(data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async saveReviewData(data) {
    try {
      const result = new this.reviewModel(data);
      return await result.save();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getReviewsData(member, data) {
    try {
      const auth_mb_id = shapeIntoMongooseObjectId(member?._id);
      const rating_ref_id = shapeIntoMongooseObjectId(data.rating_ref_id);
      let match = { rating_ref_id: rating_ref_id, cmt_status: "active" };
      let aggregationQuery = [];
      data.page = data["page"] * 1;

      const sort =
        data.order === "rating_stars"
          ? { [data.order]: -1 }
          : { createdAt: -1 };

      data.limit = data["limit"] * 1;
      aggregationQuery.push({ $match: match });
      aggregationQuery.push({ $sample: { size: data.limit } });
      aggregationQuery.push({
        $lookup: {
          from: "members",
          localField: "mb_id",
          foreignField: "_id",
          as: "member_data",
        },
      });
      aggregationQuery.push({ $sort: sort });
      const result = await this.reviewModel.aggregate(aggregationQuery).exec();

      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async deleteReviewData(member, review_id) {
    try {
      const result = await this.reviewModel.deleteOne({
        _id: shapeIntoMongooseObjectId(review_id), // _id ga o'zgartirildi
        mb_id: shapeIntoMongooseObjectId(member._id),
      });
      return result.deletedCount;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Product;
