const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followSchema = new mongoose.Schema(
  {
    // follow qilinayotgan user ->
    follow_id: { type: Schema.Types.ObjectId, required: true },
    // follow qilayotgan user ->
    subscriber_id: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// faqat 1marta subscribe bo'lish mantiq "unique" databasega yozib, qaytadi.
followSchema.index({ follow_id: 1, subscriber_id: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);
