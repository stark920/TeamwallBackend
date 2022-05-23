const jwt = require("jsonwebtoken");
const appError = require("./appError");
const handleErrorAsync = require("./handleErrorAsync");
const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  const authorization = req.headers?.authorization;
  if (authorization && authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return appError(401, "您尚未登入", next);
  }

  //check jwt is valid
  const decodedToken = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
      error ? reject(appError(401, "未授權", next)) : resolve(payload);
    });
  });

  const currentUser = await User.findById(decodedToken.id).select("+isLogin");

  if (!currentUser.isLogin) appError(401, "請重新登入", next);

  req.user = currentUser;

  next();
});

// gen token

const generateSendJWT = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  res.set("Authorization", "Bearer " + token);
  res.status(statusCode).send({
    status: true,
    user: {
      name: user.name,
      avatar: user.avatar,
    },
  });
};

module.exports = {
  isAuth,
  generateSendJWT,
};
