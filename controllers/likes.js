const mongoose = require('mongoose');
const Post = require('../models/postModel');
const Like = require('../models/likesModel');
const appError = require('../service/appError');
const console = require('../service/console');

const idPath = '_id';

async function changePostLikes(data) {
  const post = await Post.findOne({ _id: data.posts });
  const likesIndex = post.likes.indexOf(data.userId);
  if (likesIndex !== -1) {
    post.likes.splice(likesIndex, 1);
    post.save();
  } else {
    post.likes.unshift(data.userId);
    console.log(data.userId);
    post.save();
  }
}

const likes = {
  async getLikes(req, res, next) {
    const data = {
      userId: req.user[idPath],
    };
    if (!data.userId) {
      return next(appError(400, '沒有使用者ID', next));
    }
    const likesData = await Like.findOne({ userId: data.userId })
      .populate({
        path: 'userId',
        select: 'name avatar',
      }).populate({
        path: 'posts',
        select: 'name content createAt',
        populate: {
          path: 'userId',
          select: 'name avatar',
        },
      });
    return res.send({ status: true, data: likesData });
  },
  async postAndCancelLike(req, res, next) {
    const data = {
      userId: req.user[idPath],
      posts: req.body.posts,
    };
    if (!data.userId) {
      return next(appError(400, '你沒有使用者ID', next)); // 統一由express
    }
    if (!data.posts) {
      return next(appError(400, '你沒有輸入喜愛多文章', next));
    }
    if (mongoose.Types.ObjectId.isValid(data.posts)) {
      const post = await Post.findOne({ _id: data.posts });
      if (!post) {
        return next(appError(400, '沒有此文章', next));
      }
    } else {
      return next(appError(400, '文章ID格式錯誤', next));
    }

    const user = await Like.findOne({ userId: data.userId });
    let resData;
    if (user) {
      if (user.posts.includes(data.posts)) { // 移除
        const postsIndex = user.posts.indexOf(data.posts);
        user.posts.splice(postsIndex, 1);
        user.save();

        changePostLikes(data);
        resData = user;
      } else { // 收藏
        user.posts.unshift(data.posts);
        user.save();
        changePostLikes(data);
        resData = user;
      }
    } else {
      const newLike = await Like.create({
        userId: data.userId,
        posts: [data.posts],
      });

      changePostLikes(data);
      resData = newLike;
    }
    return res.send({ status: true, data: resData });
  },
};

module.exports = likes;
