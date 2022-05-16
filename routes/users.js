const express = require('express');
const router = express.Router();
const userValidator = require('../validates/users');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const Imgur = require('../utils/imgur');
const User = require('../models/userModel');
const {
  appError,
  isAuth,
  handleErrorAsync,
  generateSendJWT,
  upload,
} = require('../service');

// 登入權限測試
router.get(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '登入權限測試'
   * #swagger.description = '如為登入狀態，回傳使用者資訊'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '取得使用者資訊',
        schema: {
          status: true,
          data: {
            name: '',
            avatar: ''
          }
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/check',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (!req.user) return appError(401, '此帳號無法使用，請聯繫管理員', next);
    res.send({
      status: true,
      data: {
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });
  })
);

// 登入會員
router.post(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '登入會員'
   * #swagger.description = '密碼限制 8~20 字元'
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        email: 'abc123@abc.ab',
        password: '12345678'
      }
    }
   * #swagger.responses[200] = {
        description: '登入成功時，回傳 headers 中會帶有 token',
        schema: {
          status: true,
          message: '登入成功'
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/sign-in',
  userValidator.signIn,
  handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(401, '輸入資料錯誤', next);

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +isLogin');
    if (!user) return appError(401, '信箱或密碼錯誤', next);

    const result = await bcrypt.compare(password, user.password);
    if (!result) return appError(401, '信箱或密碼錯誤', next);

    await User.findByIdAndUpdate(user._id, { isLogin: true });

    generateSendJWT(user, 200, res);
  })
);

// 登出會員
router.delete(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '登出會員'
   * #swagger.description = '無需夾帶資料，需要檢查 token'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '修改登入狀態為 false',
        schema: {
          status: true,
          message: '登出成功'
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤原因'
        }
      }
   */
  '/sign-out',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (!req.user) return appError(401, '帳號異常，請聯繫管理員', next);

    await User.findByIdAndUpdate(req.user._id, { isLogin: false });

    res.send({ status: true, message: '登出成功' });
  })
);

// 註冊會員
router.post(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '註冊會員'
   * #swagger.description = '暱稱限制 2~10 字元，密碼限制 8~20 字元'
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        name: 'Meme',
        email: 'abc123@abc.ab',
        password: '12345678'
      }
    }
   * #swagger.responses[200] = {
        description: '註冊後，需要登入才能拿token，修改登入狀態',
        schema: {
          status: true,
          message: '註冊成功'
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/sign-up',
  userValidator.signUp,
  handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    const { email, name } = req.body;
    const emailIsUsed = await User.find({ email });
    if (emailIsUsed.length > 0) return appError(422, '信箱已被使用', next);

    const password = await bcrypt.hash(req.body.password, 12);
    await User.create({ email, password, name });

    res.send({ status: true, message: '註冊成功' });
  })
);

// 更新使用者資料
router.patch(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '更新使用者資料'
   * #swagger.description = '夾帶圖片時需使用 FormData 格式'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.consumes = ['multipart/form-data']  
   * #swagger.parameters['avatar'] = {
        in: 'formData',
        type: 'file',
        description: '上傳頭像'
      }
   * #swagger.parameters['name'] = {
        in: 'formData',
        type: 'string',
        require: 'true',
        description: '暱稱(如果不夾帶圖片，只修改暱稱，可以用json傳)'
      }
   * #swagger.responses[200] = {
        description: '取得使用者資訊',
        message: '更新成功'
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/profile',
  isAuth,
  upload.single('avatar'),
  userValidator.updateProfile,
  handleErrorAsync(async (req, res, next) => {
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
  })
);

// 更新使用者密碼
router.patch(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '修改密碼'
   * #swagger.description = '密碼限制 8~20 字元'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        password: '12345678',
        passwordConfirm: '12345678',
      }
    }
   * #swagger.responses[200] = {
        description: '修改成功',
        schema: {
          status: true,
          message: '修改成功'
        }
      }
   * #swagger.responses[401] = {
        description: '修改失敗',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/profile/pwd',
  isAuth,
  userValidator.updatePassword,
  handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    if (!req.user) return appError(401, '此帳號無法使用，請聯繫管理員', next);

    const password = await bcrypt.hash(req.body.password, 12);
    await User.findByIdAndUpdate(req.user._id, { password });
    res.send({ status: true, message: '修改成功' });
  })
);

// 取得指定用戶資訊
router.get(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '取得指定用戶資訊'
   * #swagger.description = '需要用戶 Id'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '取得成功',
        schema: {
          status: true,
          data: {}
        }
      }
   * #swagger.responses[401] = {
        description: '取得失敗',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/:id',
  isAuth,
  userValidator.getProfile,
  handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    const user = await User.findById(req.params.id).select('-avatar.deleteHash -avatar._id');
    if (!user) return appError(401, '查無該用戶資訊', next);

    res.send({ status: true, data: user });
  })
);

// ＊＊＊測試用＊＊＊ 取得所有會員資料
router.get(
  /**
   * #swagger.tags = ['Users ＊＊＊測試用＊＊＊']
   * #swagger.summary = '取得所有會員資料'
   */
  '/',
  handleErrorAsync(async (req, res, next) => {
    const users = await User.find().select('+password +isLogin');
    res.send({ status: true, data: users });
  })
);

// ＊＊＊測試用＊＊＊ 刪除所有會員資料
router.delete(
  /**
   * #swagger.tags = ['Users ＊＊＊測試用＊＊＊']
   * #swagger.summary = '刪除所有會員資料'
   */
  '/',
  handleErrorAsync(async (req, res, next) => {
    const users = await User.deleteMany({});
    res.send({ status: true, data: users });
  })
);

module.exports = router;
