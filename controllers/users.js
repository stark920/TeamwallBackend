const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const Imgur = require('../utils/imgur');
const User = require('../models/userModel');
const { appError, handleErrorAsync, generateSendJWT } = require('../service');

const user = {
  check: handleErrorAsync(async (req, res, next) => {
    if (!req.user) return appError(401, '此帳號無法使用，請聯繫管理員', next);
    res.send({
      status: true,
      data: {
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });
  }),
  signIn: handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(401, '輸入資料錯誤', next);

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +isLogin');
    if (!user) return appError(401, '信箱或密碼錯誤', next);

    const result = await bcrypt.compare(password, user.password);
    if (!result) return appError(401, '信箱或密碼錯誤', next);

    await User.findByIdAndUpdate(user._id, { isLogin: true });

    generateSendJWT(user, 200, res);
  }),
  signOut: handleErrorAsync(async (req, res, next) => {
    if (!req.user) return appError(401, '帳號異常，請聯繫管理員', next);

    await User.findByIdAndUpdate(req.user._id, { isLogin: false });

    res.send({ status: true, message: '登出成功' });
  }),
  signUp: handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    const { email, name } = req.body;
    const emailIsUsed = await User.find({ email });
    if (emailIsUsed.length > 0) return appError(422, '信箱已被使用', next);

    const password = await bcrypt.hash(req.body.password, 12);
    await User.create({ email, password, name });

    res.send({ status: true, message: '註冊成功' });
  }),
  updateProfile: handleErrorAsync(async (req, res, next) => {
    if (!req.user) return appError(401, '此帳號無法使用，請聯繫管理員', next);

    let avatar;
    if (req.file) {
      if (req.user.avatar?.deleteHash) {
        await Imgur.delete([req.user.avatar]);
      }
      const images = await Imgur.upload([req.file]);
      avatar = images[0];
    }

    const data = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        avatar,
      },
      { new: true }
    );
    res.send({ status: true, data });
  }),
  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    if (!req.user) return appError(401, '此帳號無法使用，請聯繫管理員', next);

    const password = await bcrypt.hash(req.body.password, 12);
    await User.findByIdAndUpdate(req.user._id, { password });
    res.send({ status: true, message: '修改成功' });
  }),
  getProfile: handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    const user = await User.findById(req.params.id).select(
      '-avatar.deleteHash -avatar._id'
    );
    if (!user) return appError(401, '查無該用戶資訊', next);

    res.send({ status: true, data: user });
  }),
  // ＊＊＊測試用＊＊＊ 取得所有會員資料
  getAllUsers: handleErrorAsync(async (req, res, next) => {
    const users = await User.find().select('+password +isLogin');
    res.send({ status: true, data: users });
  }),
  delAllUsers: handleErrorAsync(async (req, res, next) => {
    const users = await User.deleteMany({});
    res.send({ status: true, data: users });
  }),
  getFollows: handleErrorAsync(async (req, res, next) => {
    const list = await User.find({
      followers: { $in: [req.user.id] }
    }).populate({
      path:"user",
      select:"name _id avatar"
    });
    res.send({ status: true, data: list });
  }),
  postFollow: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return appError(401, '無法追蹤自己', next);
    }

    await User.updateOne(
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id }
      },
      {
        $addToSet: { followers: { user: req.user.id } }
      }
    );
    res.send({ status: true, message: '已成功追蹤' });
  }),
  deleteFollow: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return appError(401, '無法取消追蹤自己', next);
    }

    await User.updateOne(
      {
        _id: req.user.id
      },
      {
        $pull: { followers: { user: req.params.id } }
      }
    );
    res.send({ status: true, message: '已取消追蹤' });
  })
};

module.exports = user;
