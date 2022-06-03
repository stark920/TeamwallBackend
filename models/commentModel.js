const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, '內文必填'],
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post',
      required: [true, '請輸入您的postId'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      // select: false,
      required: [true, '請輸入您的userId'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: true,
    },
  },
  {
    versionKey: false,
  },
);

commentsSchema.pre(/^find/, function populateUserInfo(next) {
  this.populate({
    path: 'userId',
    select: 'name id avatar.url',
  });
  next();
});

const Comment = mongoose.model('comment', commentsSchema);

module.exports = Comment;
