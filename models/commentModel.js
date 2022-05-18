const mongoose = require('mongoose')
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
      required: [true, '請輸入您的userId'],
    },
  },
  {
    versionKey: false,
  }
)

const Comment = mongoose.model('comment', commentsSchema)

module.exports = Comment