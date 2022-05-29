const User = require('../models/userModel');
const {
  appError,
  handleErrorAsync,
  generateSendJWT,
  generateUrlJWT,
} = require('../service');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const Imgur = require('../utils/imgur');
const jwt = require('jsonwebtoken');
const sendMail = require('../service/email');
const path = require('path');
const thirdPartySignIn = require('../service/thirdPartySignIn');

const user = {
  // 檢查token
  check: handleErrorAsync(async (req, res, next) => {
    // isAuth通過就可以直接回傳資料
    const { _id, name, avatar, gender } = req.user;
    res.send({
      status: true,
      data: {
        id: _id,
        name,
        avatar: avatar.url,
        gender,
      },
    });
  }),
  // 登入
  signIn: handleErrorAsync(async (req, res, next) => {
    // 資料檢查錯誤處理
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(400, '輸入資料錯誤', next);

    const { email, password } = req.body;

    // 取得帳號的密碼和啟用狀態
    const user = await User.findOne({ email }).select(
      '+password +activeStatus'
    );

    // 錯誤處理
    if (!user) return appError(401, '信箱或密碼錯誤', next);
    if (user.activeStatus === 'none' || user.activeStatus === 'third')
      return appError(401, '尚未啟用一般登入', next);
    const result = await bcrypt.compare(password, user.password);
    if (!result) return appError(401, '信箱或密碼錯誤', next);

    // 更新帳號為登入狀態並發送token
    await User.findByIdAndUpdate(user._id, { isLogin: true });
    generateSendJWT(user, 200, res);
  }),
  // 登出
  signOut: handleErrorAsync(async (req, res, next) => {
    // 更新帳號為登出狀態
    await User.findByIdAndUpdate(req.user._id, { isLogin: false });
    res.send({ status: true, message: '登出成功' });
  }),
  // 註冊
  signUp: handleErrorAsync(async (req, res, next) => {
    // 資料檢查錯誤處理
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(400, '輸入資料有誤', next);

    const { email, name } = req.body;
    // 檢查信箱是否存在 檢查會員總量是否超過
    const user = await User.findOne({ email }).select('+activeStatus');
    const limit = await User.count();
    if (!user && limit >= 500) {
      return appError(422, '會員數量已達上限', next);
    }
    if (
      user &&
      (user.activeStatus === 'meta' || user.activeStatus === 'both')
    ) {
      return appError(422, '信箱已被使用', next);
    }

    // 製作信件內容並發送
    const activeCode = jwt.sign({ email, name }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    const mail = {
      from: 'MetaWall <metawall001@gmail.com>',
      subject: '[MetaWall]帳號啟用確認信',
      to: email,
      text: `尊敬的 ${name} 您好！點選連結即可啟用您的 MetaWall 帳號，[https://secret-scrubland-17327.herokuapp.com/users/checkCode?code=${activeCode}] 為保障您的帳號安全，請在24小時內點選該連結，您也可以將連結複製到瀏覽器位址列訪問。`,
    };
    const result = await sendMail(mail);

    // 確認寄送是否成功
    if (!result.startsWith('250 2.0.0 OK')) {
      return appError(422, '寄送確認信件失敗，請嘗試其他信箱', next);
    }

    // 沒帳號>建立新帳號 有帳號>更新密碼
    const password = await bcrypt.hash(req.body.password, 12);
    if (!user) {
      await User.create({ email, password, name });
    } else {
      await User.findByIdAndUpdate(user._id, { password });
    }

    res.send({ status: true, message: '已將啟用確認信件寄送至您的信箱' });
  }),
  // 帳號啟用檢查
  checkCode: handleErrorAsync(async (req, res, next) => {
    // 解析token
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(req.query.code, process.env.JWT_SECRET, (error, payload) => {
        error
          ? res.sendFile(
              path.join(__dirname, '../public/emailCheckFailed.html')
            )
          : resolve(payload);
      });
    });

    // 取得註冊的資料
    const user = await User.findOne({
      email: decodedToken.email,
    }).select('+activeStatus');
    // 再次確認
    if (!user) {
      res.sendFile(path.join(__dirname, '../public/emailCheckFailed.html'));
      return;
    }

    // 更新啟用狀態
    let activeStatus;
    if (user.activeStatus === 'none') {
      activeStatus = 'meta';
    } else if (user.activeStatus === 'third') {
      activeStatus = 'both';
    } else {
      // 已經啟用
      res.sendFile(path.join(__dirname, '../public/emailCheckFailed.html'));
      return;
    }
    await User.findByIdAndUpdate(user._id, {
      name: decodedToken.name,
      activeStatus,
    });

    res.sendFile(path.join(__dirname, '../public/emailCheckSuccess.html'));
  }),
  // 修改個人資料
  updateProfile: handleErrorAsync(async (req, res, next) => {
    let avatar;
    if (req.file) {
      if (req.user.avatar?.deleteHash) {
        await Imgur.delete([req.user.avatar]);
      }
      const images = await Imgur.upload([req.file]);
      avatar = images[0];
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        gender: req.body?.gender,
        avatar,
      },
      { new: true }
    );

    const data = {
      id: user._id,
      name: user.name,
      avatar: user.avatar.url,
      gender: user.gender,
    };
    res.send({ status: true, data });
  }),
  // 修改密碼
  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    const password = await bcrypt.hash(req.body.password, 12);
    await User.findByIdAndUpdate(req.user._id, { password });
    res.send({ status: true, message: '修改成功' });
  }),
  // 取得個人資料
  getProfile: handleErrorAsync(async (req, res, next) => {
    const { errors } = validationResult(req);
    if (errors.length > 0) return appError(422, '輸入資料有誤', next);

    const user = await User.findById(req.params.id);
    if (!user) return appError(401, '查無該用戶資訊', next);

    const { _id, name, avatar, gender, followers } = user;
    const data = {
      id: _id,
      name,
      avatar: avatar.url,
      gender,
      followers,
    };
    res.send({ status: true, data });
  }),
  getFollows: handleErrorAsync(async (req, res, next) => {
    const list = await User.find({
      followers: { $in: [req.user._id] },
    }).populate({
      path: 'user',
      select: 'name _id avatar',
    });
    res.send({ status: true, data: list });
  }),
  // 追蹤用戶
  postFollow: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return appError(401, '無法追蹤自己', next);
    }

    await User.updateOne(
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id },
      },
      {
        $addToSet: { followers: { user: req.user.id } },
      }
    );
    res.send({ status: true, message: '已成功追蹤' });
  }),
  // 退追用戶
  deleteFollow: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return appError(401, '無法取消追蹤自己', next);
    }

    await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: { followers: { user: req.user.id } },
      }
    );
    res.send({ status: true, message: '已取消追蹤' });
  }),
  // 第三方登入（google）
  google: handleErrorAsync(async (req, res, next) => {
    const data = {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    };
    thirdPartySignIn('google', data, res);
  }),
  // 第三方登入（facebook）
  facebook: handleErrorAsync(async (req, res, next) => {
    const data = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture.data.url,
    };
    thirdPartySignIn('facebook', data, res);
  }),
  // 第三方登入（discord)
  discord: handleErrorAsync(async (req, res, next) => {
    const data = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.username,
      picture: req.user?.avatar,
    };
    thirdPartySignIn('discord', data, res);
  }),
};

module.exports = user;
