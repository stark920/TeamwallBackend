const Post = require('../models/postModel');
const Like = require('../models/likesModel')
const { appError, handleErrorAsync } = require("../service");
const Imgur = require('../utils/imgur');

const posts = {
  getPosts: handleErrorAsync(async (req, res, next) => {
    const timeSort = req.query.timeSort == 'asc' ? 1 : -1
    const search = req.query.search ? { content: new RegExp(req.query.search) } : {};
    const queryRecords = {
      limit: req.query.limit,
      skip: req.query.skip,
    }
    const posts = await Post.find(search).populate({
      path: 'userId',
      select: 'name avatar'
    }).sort({ 'createAt': timeSort })
      .skip(queryRecords.skip)
      .limit(queryRecords.limit);
    res.send({ status: true, data: posts });
  }),
  getPost: handleErrorAsync(async (req, res, next) => {
    const post = await Post.find({ _id: req.params.id }).populate({
      path: 'userId',
      select: 'name avatar'
    })
    // 無資料，回傳空陣列
    res.send({ status: true, data: post });
  }),
  postPost: handleErrorAsync(async (req, res, next) => {
    if (req.body.content === undefined) return appError(400, '需要 content 欄位', next);
    if (req.body.content === "") return appError(400, 'content 不能為空值', next);
    const data = {
      userId: req.user._id,
      content: req.body.content
    };
    if (req.files.length > 0) {
      data.image = await Imgur.upload(req.files);
    }
    const newPost = await Post.create({
      ...data,
    });
    res.send({ status: true, data: newPost });
  }),
  patchPost: handleErrorAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return appError(400, '無此貼文', next);
    if (req.body.content === undefined) return appError(400, '需要 content 欄位', next);
    if (req.body.content === "") return appError(400, 'content 不能為空值', next);
    const updatePost = await Post.findByIdAndUpdate(req.params.id, { content: req.body.content }).populate({
      path: 'userId',
      select: 'name avatar'
    });
    res.send({ status: true, data: updatePost });
  }),
  deletePosts: handleErrorAsync(async (req, res, next) => {
    const posts = await Post.deleteMany({});
    res.send({ status: true, data: posts });
  }),
  deletePost: handleErrorAsync(async (req, res, next) => {
    const posts = await Post.deleteOne({ _id: req.params.id });
    res.send({ status: true, data: posts });
  })
}

module.exports = posts;