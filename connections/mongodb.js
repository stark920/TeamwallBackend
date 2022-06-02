const mongoose = require('mongoose');
const console = require('../service/console');

const DB = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log('資料庫連線成功');
}).catch((error) => {
  console.log(error);
});
