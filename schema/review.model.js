const mongoose = require("mongoose");
const { cmt_status_enums, cmt_group_enums } = require("../lib/config");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema(
  {
    rating_ref_id: { type: Schema.Types.ObjectId, required: true },
    mb_id: { type: Schema.Types.ObjectId, required: true },
    cmt_content: { type: String, required: false },
    cmt_status: {
      type: String,
      enum: {
        values: cmt_status_enums,
        massege: "{VALUE} is not among permitted values",
      },
      required: true,
      default: "active",
    },
    rating_group: {
      type: String,
      required: true,
      enum: {
        values: cmt_group_enums,
        massege: "{VALUE} is not among permitted values",
      },
    },
    rating_stars: {
      type: Number,
      required: false,
    },
    cmt_likes: {
      type: Number,
      required: false,
    },
    cmt_images: { type: Array, required: false, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
