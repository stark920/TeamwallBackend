const jwt = require('jsonwebtoken');
const appError = require('./appError');
const handleErrorAsync = require('./handleErrorAsync');
const User = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

// 檢查 token
const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;

  const authorization = req.headers?.authorization;

  if (authorization && authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return appError(401, '您尚未登入', next);
  }

  const decodedToken = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
      error ? reject(appError(401, '未授權', next)) : resolve(payload);
    });
  });

  const currentUser = await User.findById(decodedToken.id).select('+isLogin +activeStatus');

  if (!currentUser) return appError(401, '此帳號無法使用，請聯繫管理員', next);

  if (currentUser.activeStatus === 'none') return appError(401, '帳號尚未啟用', next);

  if (!currentUser.isLogin) return appError(401, '請重新登入', next);

  req.user = currentUser;

  next();
});

// 一般登入 回傳json
const generateSendJWT = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  res.set('Authorization', 'Bearer ' + token);

  res.status(statusCode).send({
    status: true,
    user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar.url,
        gender: user.gender
    },
  });
};

// 第三方登入 回傳轉址
const generateUrlJWT = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  const path = `/TeamWall/#/callback?token=${token}&id=${user._id}&name=${user.name}&avatar=${user.avatar.url}&gender=${user.gender}`;
  res.redirect(path);
};

module.exports = {
  isAuth,
  generateUrlJWT,
  generateSendJWT,
};
