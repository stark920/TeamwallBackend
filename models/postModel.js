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
  createdAt: {
    type: Date,
    default: Date.now,
    select: true,
  },
},
{
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

postsSchema.virtual('comments', {
  ref: 'comment',
  foreignField: 'postId',
  localField: '_id'
});

const Post = mongoose.model('post', postsSchema);

module.exports = Post;