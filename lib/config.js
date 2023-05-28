const mongoose = require("mongoose");

exports.member_type_enums = ["USER", "ADMIN", "PEDAL", "MARKET"];
exports.member_status_enums = ["ONPAUSE", "ACTIVE", "DELETED"];
exports.ordernary_enums = ["Y", "N"];
exports.product_collection_enums = [
  "food",
  "meat",
  "drink",
  "fresh",
  "family",
  "readyToEat",
  "parfumerie",
  "texno",
];

exports.cmt_status_enums = ["block", "active"];
exports.cmt_group_enums = ["market", "product", "community"];

exports.product_status_enums = ["PAUSED", "PROCESS", "DELETED"];
exports.product_size_enums = [
  "small",
  "normal",
  "large",
  "set",
  "1",
  "2",
  "3",
  "300gr",
  "500gr",
];
exports.product_volume_enums = [0.5, 1, 1.2, 1.5, 2]; //liter
exports.product_weight_enums = [0.5, 1, 2]; //kg
exports.product_etc_enums = [1, 2]; //pc -dona

exports.order_status_enums = ["PAUSED", "PROCESS", "FINISHED", "DELETED"];

exports.like_view_group_list = ["product", "member", "community", "review"];
exports.board_id_enum_list = ["evaluation", "review", "story"];
exports.board_article_status_enum_list = ["active", "deleted"];

/***************************
 *    MONGODB RELATED COMMANDS *
 ****************************/
// ObjectId ni mongodbId ga o'zgartirish(kuchaytirish)
exports.shapeIntoMongooseObjectId = (target) => {
  if (typeof target === "string") {
    return new mongoose.Types.ObjectId(target);
  } else return target;
};

// menga follow qilgan userga men ham follow qilganmanmi? ->
exports.lookup_auth_member_following = (mb_id, origin) => {
  const follow_id = origin === "follows" ? "$subscriber_id" : "$_id";
  return {
    $lookup: {
      from: "follows",
      let: {
        lc_follow_id: follow_id,
        lc_subscriber_id: mb_id,
        nw_my_following: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$follow_id", "$$lc_follow_id"] },
                { $eq: ["$subscriber_id", "$$lc_subscriber_id"] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            subscriber_id: 1,
            follow_id: 1,
            my_following: "$$nw_my_following",
          },
        },
      ],
      as: "me_followed",
    },
  };
};

exports.lookup_auth_member_liked = (mb_id) => {
  return {
    $lookup: {
      from: "likes",
      let: {
        lc_liken_item_id: "$_id",
        lc_mb_id: mb_id,
        nw_my_favorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$like_ref_id", "$$lc_liken_item_id"] },
                { $eq: ["$mb_id", "$$lc_mb_id"] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            mb_id: 1,
            like_ref_id: 1,
            my_favorite: "$$nw_my_favorite",
          },
        },
      ],
      as: "me_liked",
    },
  };
};

exports.lookup_blog_reviews = () => {
  return {
    $lookup: {
      from: "reviews",
      let: { bo_article_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$rating_ref_id", "$$bo_article_id"] }],
            },
          },
        },
        {
          $group: {
            _id: "$rating_stars",
            count: { $sum: 1 },
            totalRating: { $sum: "$rating_stars" },
          },
        },

        {
          $group: {
            _id: null,
            reviews_cnt: { $sum: "$count" },
            totalRating: { $sum: "$totalRating" },
            ratingByValue: {
              $push: {
                k: { $toString: "$_id" },
                v: "$count",
              },
            },
          },
        },
        {
          $addFields: {
            ratingByValue: {
              $arrayToObject: "$ratingByValue",
            },
          },
        },

        {
          $addFields: {
            average_rating: { $divide: ["$totalRating", "$reviews_cnt"] },
          },
        },

        {
          $project: {
            _id: 0,
            reviews_cnt: 1,
            average_rating: 1,
            ratingByValue: 1,
          },
        },
      ],
      as: "reviews",
    },
  };
};
