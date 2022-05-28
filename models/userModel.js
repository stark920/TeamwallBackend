const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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
        _id: false,
        deleteHash: String,
        url: String,
      },
      default: {
        deleteHash: '',
        url: 'https://i.imgur.com/gA5JWK5.png',
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
      default: 'others',
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
    followers: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    googleId: {
      type: String,
      select: false,
    },
    facebookId: {
      type: String,
      select: false,
    },
    isLogin: {
      type: Boolean,
      default: false,
      select: false,
    },
    activeStatus: {
      type: String,
      enum: ['none', 'meta', 'third', 'both'],
      default: 'none',
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    versionKey: false,
    collection: 'Users',
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;
