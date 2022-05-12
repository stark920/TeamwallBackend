const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema({
  userInfo: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, '請輸入您的userId']
  },
  posts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'post',
  }],
  createAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
},
{
  versionKey: false, // __v: 引藏
});

const Like = mongoose.model('like', likesSchema);

module.exports = Like;