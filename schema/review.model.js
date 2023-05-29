const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema(
  {
    rating_ref_id: { type: Schema.Types.ObjectId, required: true },
    mb_id: { type: Schema.Types.ObjectId, required: true },
    cmt_content: { type: String, required: false },
    cmt_status: {
      type: String,
      default: "active",
      required: false,
    },
    rating_group: {
      type: String,
      ref: "product",
      required: false,
    },
    rating_stars: {
      type: Number,
      required: false,
    },
    cmt_likes: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
