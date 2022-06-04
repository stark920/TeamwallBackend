const appError = require('./appError');
const { isAuth, generateUrlJWT, generateSendJWT } = require('./auth');
const handleErrorAsync = require('./handleErrorAsync');
const upload = require('./upload');
const console = require('./console');
const resError = require('./resError');

module.exports = {
  appError,
  resError,
  isAuth,
  generateUrlJWT,
  generateSendJWT,
  handleErrorAsync,
  upload,
  console,
};
