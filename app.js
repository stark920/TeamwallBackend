const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const resError = require('./service/resError');

process.on('uncaughtException', err => {
	console.error('Uncaught Exception！')
  console.error(err);
	process.exit(1);
});

// 連線 mongodb
require('./connections');

const postsRouter = require('./routes/posts'); //管理Router
const usersRouter = require('./routes/users');
const likesRouter = require('./routes/likes');
const chatRouter = require('./routes/chat');
const commentRouter = require('./routes/comment')
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/likes', likesRouter);
app.use('/chat', chatRouter);
app.use('/comment', commentRouter)
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));

app.use(function (req, res, next) {
  res.status(404).json({
    status: false,
    message: '您的路由不存在',
  });
});

// express 錯誤處理
app.use(function(err, req, res, next) {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resError.dev(err, res);
  } 
  // production
  if (err.name === 'ValidationError') {
    //mongoose 的欄位錯誤 error.name
    err.message = '資料欄位未填寫正確，請重新輸入！';
    err.isOperational = true;
    return resError.prod(err, res)
  }
  resError.prod(err, res);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection!');
  if (process.env.NODE_ENV === 'dev') {
    console.log('未知的 rejection:', promise, '原因:', err);
  }
});

module.exports = app;
