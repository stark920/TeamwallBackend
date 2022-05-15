const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入您的名字']
  },
  email: {
    type: String,
    required: [true, '請輸入您的 Email'],
    unique: true,
    lowercase: false,
    select: false
  },
  photo: String,
  chatRecord:{
    type:[{
      roomId: {
        type: mongoose.Schema.ObjectId,
        ref: "ChatRoom",
      },
      receiver: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      }
    }],
    default:[]
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;