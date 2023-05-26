const Bo_articleModel = require("../schema/bo_article.model");
const ProductModel = require("../schema/product.model");
const MemberModel = require("../schema/member.model");
const LikeModel = require("../schema/like.model");
const ReviewModel = require("../schema/review.model");
const {
  shapeIntMongooseObjectId,
  lookup_auth_member_liked,
} = require("../lib/config");

const Definer = require("../lib/mistakes");
const assert = require("assert");

class Review {
  constructor(mb_id) {
    this.reviewModel = ReviewModel;
    this.memberModel = MemberModel;
    this.productModel = ProductModel;
    this.likeModel = LikeModel;
    this.boArticleModel = Bo_articleModel;
    this.mb_id = mb_id;
  }

  async reviewChosenItemBymember(
    id,
    rating_ref_id,
    group_type,
    rating_stars,
    cmt_content
  ) {
    try {
      rating_ref_id = shapeIntMongooseObjectId(rating_ref_id);
      id = shapeIntMongooseObjectId(id);

      const isValid = await this.validateTargetItem(rating_ref_id, group_type);
      assert.ok(isValid, Definer.general_err2);

      const data = await this.createReview(
        id,
        rating_ref_id,
        group_type,
        rating_stars,
        cmt_content
      );
      assert.ok(data, Definer.general_err1);

      let result = {
        rating_group: data.rating_group,
        rating_ref_id: data.rating_ref_id,
        rating_stars: data.rating_stars,
        cmt_content: data.cmt_content,
      };

      return result;
    } catch (err) {
      throw err;
    }
  }

  async createReview(id, rating_ref_id, group_type, rating_stars, cmt_content) {
    try {
      const new_review = new this.reviewModel({
        mb_id: id,
        rating_ref_id: rating_ref_id,
        rating_group: group_type,
        rating_stars: rating_stars,
        cmt_content: cmt_content,
      });
      const result = await new_review.save();
      return result;
    } catch (err) {
      throw err;
    }
  }

  async validateTargetItem(rating_ref_id, group_type) {
    try {
      let result;
      switch (group_type) {
        case "member":
          result = await this.memberModel
            .findOne({
              _id: rating_ref_id,
              mb_status: "ACTIVE",
            })
            .exec();
          break;
        case "product":
          result = await this.productModel
            .findOne({
              _id: rating_ref_id,
              product_status: "PROCESS",
            })
            .exec();
          break;
        case "community":
        default:
          result = await this.boArticleModel
            .findOne({
              _id: rating_ref_id,
              art_status: "active",
            })
            .exec();
          break;
      }

      return !!result;
    } catch (err) {
      throw err;
    }
  }

  async getReviewsData(member, data) {
    try {
      const auth_mb_id = shapeIntMongooseObjectId(member?._id);
      const rating_ref_id = shapeIntMongooseObjectId(data.rating_ref_id);
      let match = { rating_ref_id: rating_ref_id, cmt_status: "active" };
      let aggregationQuery = [];
      data.limit = data["limit"] * 1;
      aggregationQuery.push({ $match: match });
      aggregationQuery.push({ $sample: { size: data.limit } });

      const result = await this.reviewModel.aggregate(aggregationQuery).exec();

      assert(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getTargetRatingData(rating_ref_id) {
    try {
      const ref_id = shapeIntMongooseObjectId(rating_ref_id);
      const data = await this.reviewModel.find({
        rating_ref_id: ref_id,
      });
      let numberofeveryrating = {
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0,
      };
      data.map((ele) => {
        if (ele.rating_stars === 1) {
          numberofeveryrating.one++;
        } else if (ele.rating_stars === 2) {
          numberofeveryrating.two++;
        } else if (ele.rating_stars === 3) {
          numberofeveryrating.three++;
        } else if (ele.rating_stars === 4) {
          numberofeveryrating.four++;
        } else if (ele.rating_stars === 5) {
          numberofeveryrating.five++;
        }
      });

      numberofeveryrating.one = (numberofeveryrating.one * 100) / data.length;
      numberofeveryrating.two = (numberofeveryrating.two * 100) / data.length;
      numberofeveryrating.three =
        (numberofeveryrating.three * 100) / data.length;
      numberofeveryrating.four = (numberofeveryrating.four * 100) / data.length;
      numberofeveryrating.five = (numberofeveryrating.five * 100) / data.length;

      let overall = 0;
      data.map((ele) => {
        return (overall += ele.rating_stars);
      });

      const result = {
        reviews_cnt: data.length,
        average_rating: overall / 5,
        ratingByValue: numberofeveryrating,
      };
      console.log("data", data);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Review;
