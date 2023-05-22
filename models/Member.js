const MemberModel = require("../schema/member.model");
const Definer = require("../lib/mistake");
const assert = require("assert");
const bcrypt = require("bcryptjs"); // passwordni shifrlash uchun
const {
  shapeIntoMongooseObjectId,
  lookup_auth_member_following,
  lookup_auth_member_liked,
} = require("../lib/config");
const View = require("./View");
const Like = require("./Like");

class Member {
  constructor() {
    // shartli ravishda kichkina harfda yozib oldik.
    this.memberModel = MemberModel;
  }
  // req.body kelyapti
  async signupData(input) {
    try {
      // passwordni shifrlash uchun ->
      const salt = await bcrypt.genSalt();
      input.mb_password = await bcrypt.hash(input.mb_password, salt);
      const new_member = new this.memberModel(input);

      let result;
      try {
        // databasega save qiladi
        result = await new_member.save();
      } catch (mongo_err) {
        console.log(mongo_err);
        throw new Error(Definer.auth_err6);
      }

      result.mb_password = "";
      // resultni tashqariga javob -> return qilganimiz uchun
      return result;
    } catch (err) {
      throw err;
    }
  }

  async loginData(input) {
    try {
      const member = await this.memberModel
        .findOne({ mb_nick: input.mb_nick }, { mb_nick: 1, mb_password: 1 })
        .exec();
      // agar member nick true bo'lsa ok, bo'lmasa Definer(ERROR) ->
      assert.ok(member, Definer.auth_err2);

      // bu yerda login bo'layotganda bcrypt inputdagi pswni databaseagi psw bilan o'zi solishtirib oladi.
      const isMatch = await bcrypt.compare(
        input.mb_password,
        member.mb_password
      );
      // agar member password true bo'lsa ok, bo'lmasa Definer(ERROR) ->
      assert.ok(isMatch, Definer.auth_err3);

      // bir hil password kirtgan bo'lsa, mb_nick m'lumotlarini olib orqaga qaytaradi -> [rstaurantController 74 qator]
      return await this.memberModel.findOne({ mb_nick: input.mb_nick }).exec();
    } catch (err) {
      throw err;
    }
  }

  async getChosenMemberData(member, id) {
    try {
      // ObjectId ni mongodbId ga o'zgartirish(kuchaytirish) ->
      const auth_mb_id = shapeIntoMongooseObjectId(member?._id);
      id = shapeIntoMongooseObjectId(id);
      console.log("member:", member);

      let aggregateQuery = [
        { $match: { _id: id, mb_status: "ACTIVE" } },
        { $unset: "mb_password" }, // "$unset" mb_passwordni yashiradi
      ];

      // login bo'lmagan bo'lsa bu yerdan o'tib ketadi ->
      if (member) {
        await this.viewChosenItemByMember(member, id, "member");
        // auth member ko'rayotgan itemiga like bosganligini check qilish ->
        aggregateQuery.push(lookup_auth_member_liked(auth_mb_id));
        aggregateQuery.push(
          lookup_auth_member_following(auth_mb_id, "members")
        );
      }

      const result = await this.memberModel
        // aggregate mbni hamma datasini olib beradi
        .aggregate([aggregateQuery])
        .exec();

      assert.ok(result, Definer.general_err2);
      return result[0];
    } catch (err) {
      throw err;
    }
  }

  async viewChosenItemByMember(member, view_ref_id, group_type) {
    try {
      view_ref_id = shapeIntoMongooseObjectId(view_ref_id);
      const mb_id = shapeIntoMongooseObjectId(member._id);

      const view = new View(mb_id);
      // validation needed haqiqatda bor accauntmi "View.js[11]"
      const isValid = await view.validateChosenTarget(view_ref_id, group_type);
      console.log("isValid", isValid);
      assert.ok(isValid, Definer.general_err2);

      // logged user has seen target before (user bu productni ko'rganmi ? ->)
      const doesExist = await view.checkViewExistence(view_ref_id);
      console.log("doesExist:", doesExist);

      if (!doesExist) {
        // user bu productni ko'rgan bo'lsa o'tib ketadi
        const result = await view.insertMemberView(view_ref_id, group_type);
        assert.ok(result, Definer.general_err1);
      }
      // const result = await view.insertMemberView(view_ref_id, group_type);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async likeChosenItemByMemeber(member, like_ref_id, group_type) {
    try {
      like_ref_id = shapeIntoMongooseObjectId(like_ref_id);
      const mb_id = shapeIntoMongooseObjectId(member._id);

      const like = new Like(mb_id);
      // haqiqatda bor accauntmi ->
      const isValid = await like.validateTargetItem(like_ref_id, group_type);
      console.log("isValid", isValid);
      assert.ok(isValid, Definer.general_err2);

      // Like bosganmizmi tekshirybmiz ->
      const doesExist = await like.checkLikeExistence(like_ref_id);
      console.log("doesExist:::", doesExist);

      let data = doesExist
        ? await like.removeMemberLike(like_ref_id, group_type)
        : await like.insertMemberLike(like_ref_id, group_type);
      assert.ok(data, Definer.general_err1);

      // check qilish uchun ->
      const result = {
        like_group: data.like_group,
        like_ref_id: data.like_ref_id,
        like_status: doesExist ? 0 : 1, // data bo'sa 1+
      };
      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateMemberData(id, data, image) {
    try {
      const mb_id = shapeIntoMongooseObjectId(id);

      let params = {
        mb_nick: data.mb_nick,
        mb_phone: data.mb_phone,
        mb_address: data.mb_address,
        mb_description: data.mb_description,
        mb_image: image ? image.path : null,
      };

      for (let prop in params) if (!params[prop]) delete params[prop];
      const result = await this.memberModel
        .findOneAndUpdate({ _id: mb_id }, params, {
          runValidators: true,
          lean: true,
          returnDocument: "after",
        })
        .exec();

      assert.ok(result, Definer.general_err1);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Member;
