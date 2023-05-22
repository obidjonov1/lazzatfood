const assert = require("assert");
const {
  shapeIntoMongooseObjectId,
} = require("../lib/config");
const Definer = require("../lib/mistake");
const OrderModel = require("../schema/order.model");
const OrderItemModel = require("../schema/order_item.model");

class Order {
  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
  }

  // order item "container" --> [14~64]
  async createOrderData(member, data) {
    try {
      let order_total_amount = 0,
        delivery_cost = 0;
      const mb_id = shapeIntoMongooseObjectId(member._id);

      // "savat"ga qo'shilgan productlarni summasi ->
      data.map((item) => {
        order_total_amount += item["quantity"] * item["price"];
      });

      // ma'lum summadan keyin "pochta" bepul bo'lishi ->
      if (order_total_amount < 99000) {
        delivery_cost = 4000;
        order_total_amount += delivery_cost;
      }

      const order_id = await this.saveOrderData(
        order_total_amount,
        delivery_cost,
        mb_id
      );

      // console.log("order_id;::", order_id);

      // order items create
      await this.recordOrderItemsData(order_id, data);

      return order_id;
    } catch (err) {
      throw err;
    }
  }

  async saveOrderData(order_total_amount, delivery_cost, mb_id) {
    try {
      const new_order = new this.orderModel({
        order_total_amount: order_total_amount,
        order_delivery_cost: delivery_cost,
        mb_id: mb_id,
      });

      const result = await new_order.save();
      assert.ok(result, Definer.order_err1);

      return result._id;
    } catch (err) {
      console.log(err);
      throw new Error(Definer.order_err1);
    }
  }

  // har bir order items --->[66~102]
  async recordOrderItemsData(order_id, data) {
    try {
      const pro_list = data.map(async (item) => {
        return await this.saveOrderItemsData(item, order_id);
      });

      // pro_list Arrayni har birini ohirgacha yakunlanishini taminab beradi ->
      const results = await Promise.all(pro_list);
      console.log("results:::", results);

      return true;
    } catch (err) {
      throw err;
    }
  }

  async saveOrderItemsData(item, order_id) {
    try {
      order_id = shapeIntoMongooseObjectId(order_id);
      item._id = shapeIntoMongooseObjectId(item._id);

      const order_item = new this.orderItemModel({
        item_quantity: item["quantity"],
        item_price: item["price"],
        order_id: order_id,
        product_id: item["_id"],
      });

      const result = await order_item.save();
      assert.ok(result, Definer.order_err2);
      return "created";
    } catch (err) {
      console.log(err);
      throw new Error(Definer.order_err2);
    }
  }

  async getMyOrdersData(member, query) {
    try {
      const mb_id = shapeIntoMongooseObjectId(member._id),
        order_status = query.status.toUpperCase(),
        // agrigatte uchun kerak bo'laigan object "matches" ->
        matches = { mb_id: mb_id, order_status: order_status };

      const result = await this.orderModel
        .aggregate([
          // mb_id ga tegishli order_statusi ('PAUSED' ga teng bo'lgan) olib ber ->
          { $match: matches },
          { $sort: { createdAt: -1 } }, // <- eng ohirgi qo'shilganganlarini No:1
          {
            $lookup: {
              from: "orderitems",
              localField: "_id", // "order"
              foreignField: "order_id", // "orderItems"
              as: "order_items", // <- qaysi nom bn saqlanishi
            },
          },
          {
            /* "oders"ni ichidan "orderItems"ni oldik, "orderItems"ni ichidan "product_id"n oldik,
              va "productCollection"dan shu ID li productni hamma narsasini chaqirib oldik */
            $lookup: {
              from: "products",
              localField: "order_items.product_id", // biz yasagan natija
              foreignField: "_id",
              as: "product_data",
            },
          },
        ])
        .exec();

      // console.log("resyil:::", result)

      return result;
    } catch (err) {
      throw err;
    }
  }

  async editChosenOrderData(member, data) {
    try {
      const mb_id = shapeIntoMongooseObjectId(member._id),
        order_id = shapeIntoMongooseObjectId(data.order_id),
        order_status = data.order_status.toUpperCase();

      const result = await this.orderModel.findOneAndUpdate(
        { mb_id: mb_id, _id: order_id }, // <- qaysi datani update qilinishi
        { order_status: order_status }, // <- hozirgi statusini yangi statusga o'zgartisin
        { runValidators: true, lean: true, returnDocument: "after" }
      );
      console.log(result);

      assert.ok(result, Definer.order_err3);

      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Order;
