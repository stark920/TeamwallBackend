const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, '請輸入您的userId']
  },
  content: {
    type: String,
    required: [true,"內文必填"]
  },
  image: [{
    url: String,
    deleteHash: String,
  }],
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  }],
  comments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'comment',
  }],
  createAt: {
    type: Date,
    default: Date.now,
    select: true,
  },
},
{
  versionKey: false, // __v: 引藏
});

const Post = mongoose.model('post', postsSchema);

module.exports = Post;