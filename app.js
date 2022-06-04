const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const dotenv = require('dotenv');
const swaggerFile = require('./swagger-output.json');
const { resError, console } = require('./service');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception！');
  console.error(err);
  process.exit(1);
});

require('./connections/mongodb');
require('./connections/passport');

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const likesRouter = require('./routes/likes');
const chatRouter = require('./routes/chat');
const commentRouter = require('./routes/comment');

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
app.use('/comment', commentRouter);
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: '您的路由不存在',
  });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const error = err;
  // dev
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === 'dev') {
    return resError.dev(error, res);
  }
  // production
  if (error.name === 'ValidationError') {
    error.message = '資料欄位未填寫正確，請重新輸入！';
    error.isOperational = true;
    return resError.prod(error, res);
  }
  return resError.prod(error, res);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection!');
  if (process.env.NODE_ENV === 'dev') {
    console.log('未知的 rejection:', promise, '原因:', err);
  }
});

module.exports = app;
