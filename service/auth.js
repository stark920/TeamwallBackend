const jwt = require('jsonwebtoken');
const appError = require('./appError');
const handleErrorAsync = require('./handleErrorAsync');
const User = require('../models/userModel');

const idPath = '_id';

// 檢查 token
const isAuth = handleErrorAsync(async (req, res, next) => {
  if (!req.headers.authorization) {
    return appError(401, '未提供授權資訊', next);
  }
  const [tokenType, token] = req.headers.authorization.split(' ');
  if (tokenType !== 'Bearer' || !token) {
    return appError(401, '授權資料異常', next);
  }

  const decodedToken = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
      if (error) {
        reject(appError(401, '未授權', next));
      } else {
        resolve(payload);
      }
    });
  });

  const currentUser = await User.findById(decodedToken.id).select('+activeStatus');
  if (!currentUser) return appError(401, '此帳號無法使用，請聯繫管理員', next);
  if (currentUser.activeStatus === 'none') return appError(401, '帳號尚未啟用', next);

  req.user = currentUser;
  return next();
});

// 一般登入 回傳json
const generateSendJWT = (user, statusCode, res) => {
  const token = jwt.sign({ id: user[idPath] }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  res.set('Authorization', `Bearer ${token}`);
  const {
    _id, name, avatar, gender,
  } = user;
  res.status(statusCode).send({
    status: true,
    data: {
      id: _id,
      name,
      avatar: avatar.url,
      gender,
    },
  });
};

// 第三方登入 回傳轉址
const generateUrlJWT = (user, res) => {
  const token = jwt.sign({ id: user[idPath] }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  let path = `${process.env.WEBSITE_URL}?token=${token}&id=${user[idPath]}&name=${user.name}&avatar=${user.avatar.url}&gender=${user.gender}`;
  if (user?.mode) {
    path += `&mode=${user.mode}`;
  }
  res.redirect(path);
};

module.exports = {
  isAuth,
  generateUrlJWT,
  generateSendJWT,
};
