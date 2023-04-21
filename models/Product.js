const assert = require("assert");
const { shapeIntoMongooseObjectid } = require("../lib/config");
const Definer = require("../lib/mistake");
const ProductModel = require("../schema/product.model");

class Product {
  constructor() {
    this.productModel = ProductModel;
  }

  async getAllProductsDataResto(member) {
    try {
      // login bo'lgan memberning idsi orqali productModuldan -> [16] ->
      member._id = shapeIntoMongooseObjectid(member._id);
      const result = await this.productModel.find({
        // restaurant_mb_id = member._id bo'lgan hammasini topib beradi -> [20]
        restaurant_mb_id: member._id,
      });
      assert.ok(result, Definer.general_err1);
      // [17]-> va ularni qaytarib beradi
      return result; // restaurantController [21] ga pass qilib beradi
    } catch (err) {
      throw err;
    }
  }

  async addNewProductData(data, member) {
    try {
      data.restaurant_mb_id = shapeIntoMongooseObjectid(member._id);

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
      id = shapeIntoMongooseObjectid(id);
      mb_id = shapeIntoMongooseObjectid(mb_id);

      const result = await this.productModel
        .findOneAndUpdate(
          // qaysi objectni update qilinyapti ->
          { _id: id, restaurant_mb_id: mb_id },
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
}

module.exports = Product;
