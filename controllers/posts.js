const { handleSuccess } = require('../handler');
const Post = require('../models/postModel');
const Like = require('../models/likesModel')
const appError = require("../service/appError");
const Imgur = require('../utils/imgur');
const roles = require('../service/roles');

const posts = {
  async getPosts(req, res, next) {
    const timeSort = req.query.timeSort == 'asc' ? 1 : -1
    const search = req.query.search ? { "content": new RegExp(req.query.search) } : {};
    const posts = await Post.find(search).populate({
      path: 'userId',
      select: 'name photo'
    }).sort({ 'createAt': timeSort })
    handleSuccess(res, posts)
  },
  async postPost(req, res, next) {
    const data = req.body;
    if (!roles.checkBody('post', data, next)) return
    if (req.files.length > 0) {
      data.image = await Imgur.upload(req.files)
    }
    const newPost = await Post.create({
      ...data,
    });
    handleSuccess(res, newPost);
  },
  async patchPost(req, res, next) {
    if (!roles.checkBody('post', data, next)) return
    await Post.findByIdAndUpdate(req.user.id, req.body)
      .then(() => handleSuccess(res, '修改資料成功'))
      .catch(() => appError(400, next));
  }
}

module.exports = posts;