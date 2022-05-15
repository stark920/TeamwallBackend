const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"});

const DB =  process.env.DATABASE_COMPASS.replace('<password>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB).then(()=>{
  console.log('資料庫連線成功')
}).catch((error)=>{
  console.log(error)
})

const postsRouter = require('./routes/posts'); //管理Router
const usersRouter = require('./routes/users');
const likesRouter = require('./routes/likes');
const app = express();

process.on('uncaughtException', err => {
	console.error('Uncaughted Exception！')
	console.error(err);
	process.exit(1);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/likes', likesRouter);

app.use(function(req,res,next){
  res.status(404).json({
      status:"false",
      message:"您的路由不存在"
  })
})

// express 錯誤處理
// 正式環境錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message
    });
  } else {
    console.error('出現重大錯誤', err);
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員'
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack
  });
};
app.use(function(err, req, res, next) {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  } 
  // production
  if (err.name === 'ValidationError'){ //mongoose 的欄位錯誤 error.name
    err.message = "資料欄位未填寫正確，請重新輸入！"
    err.isOperational = true;
    return resErrorProd(err, res)
  }
  resErrorProd(err, res)
});

process.on('unhandledRejection', (err, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', err);
});

module.exports = app;
