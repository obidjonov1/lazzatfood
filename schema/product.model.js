const { ObjectID, ObjectId } = require("bson");
const mongoose = require("mongoose");
const {
  product_collection_enums,
  product_status_enums,
  product_size_enums,
  product_volume_enums,
  product_weight_enums,
  product_etc_enums,
} = require("../lib/config");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    product_collection: {
      type: String,
      required: true,
      enum: {
        values: product_collection_enums,
        message: "{VALUE} is not among permitted enum values",
      },
    },
    product_status: {
      type: String,
      required: false,
      default: "PAUSED",
      enum: {
        values: product_status_enums,
        message: "{VALUE} is not among permitted enum values",
      },
    },
    product_price: {
      type: String,
      required: true,
    },
    product_discount: {
      type: String,
      required: [false, "Please enter your product price!"],
      default: 0,
    },
    product_left_cnt: {
      type: Number,
      required: true,
    },
    product_size: {
      type: String,
      default: "normal",
      // product_volumega tegishli bo'lmasa 'product_size' uchun ("small", "normal", "large", "set")
      required: function () {
        const sized_list = ["food"];
        return sized_list.includes(this.product_collection);
      },
      enum: {
        values: product_size_enums,
        message: "{VALUE} is not among permitted enum values",
      },
    },
    product_volume: {
      type: Number,
      default: 1,
      // product_sizega tegishli bo'lmasa 'product_volume' liter uchun
      required: function () {
        return this.product_collection === "drink";
      },
      enum: {
        values: product_volume_enums,
        message: "{VALUE} is not among permitted enum values",
      },
    },
    product_weight: {
      type: Number,
      default: 1,
      // kg uchun
      required: function () {
        return (
          this.product_collection === "meat" ||
          this.product_collection === "fresh"
        );
      },
      enum: {
        values: product_weight_enums,
        message: "{VALUE} is not among permitted enum values",
      },
    },
    product_family: {
      type: Number,
      default: 1,
      // pc "dona" uchun
      required: function () {
        return (
          this.product_collection === "family" ||
          this.product_collection === "readyToEat" ||
          this.product_collection === "parfumerie" ||
          this.product_collection === "texno"
        );
      },
      enum: {
        values: product_etc_enums,
        message: "{VALUE} is not among permitted enum values",
      },
    },
    product_description: {
      type: String,
      required: true,
    },
    product_images: {
      type: Array,
      required: true,
      default: [],
    },
    product_likes: {
      type: Number,
      required: false,
      default: 0,
    },
    product_views: {
      type: Number,
      required: false,
      default: 0,
    },
    market_mb_id: {
      type: Schema.Types.ObjectId,
      // refrense qaysi databasega bog'langan ->
      ref: "Member",
      required: false,
    },
  },
  // mognodb da auto tarzda 'qo'shilgan', 'o'zgartirilgan' item vaqtini yozib beradi
  { timestamps: true } // createdAt, updatedAt
);

// Agar oshxona oldin qo'shilgan productni yana qo'shmoqchi yoki huddi o'sha "name", "size" bilan kiritmoqchi bo'lsa "ERROR" beradi ->
productSchema.index(
  {
    market_mb_id: 1,
    product_name: 1,
    product_size: 1,
    product_volume: 1,
    product_weight: 1,
    product_family: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("Product", productSchema);
