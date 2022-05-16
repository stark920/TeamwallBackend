const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      select: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: {
        deleteHash: String,
        url: String,
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
    },
    isLogin: {
      type: Boolean,
      default: false,
      select: false,
    },
    chatRecord: {
      type: [
        {
          roomId: {
            type: mongoose.Schema.ObjectId,
            ref: 'ChatRoom',
          },
          receiver: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
          },
        },
      ],
      default: [],
    },
  },
  {
    versionKey: false,
    collection: 'Users',
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;
