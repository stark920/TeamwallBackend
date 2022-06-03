const mongoose = require('mongoose');
const Post = require('../models/postModel');
const Like = require('../models/likesModel');
const Comment = require('../models/commentModel');
const { appError } = require('../service');
const Imgur = require('../utils/imgur');

const idPath = '_id';

const posts = {
  async getPosts(req, res) {
    // sort
    const timeSort = req.query.timeSort === 'old' ? 1 : -1;
    const likesSort = req.query.likesSort === 'hot' ? -1 : '';
    const postsSort = { likesNum: likesSort, createdAt: timeSort };
    if (!likesSort) delete postsSort.likesNum;

    const regexEscape = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // search
    const search = req.query.search
      ? { content: new RegExp(regexEscape(req.query.search)) }
      : {};
    // records
    const queryRecords = {
      limit: req.query.limit,
      skip: req.query.skip,
    };
    // current user
    const currentUser = req.user;

    const postsData = await Post.aggregate([
      {
        $addFields: {
          likesNum: {
            $size: '$likes',
          },
        },
      },
      {
        $match: search,
      },
      {
        $sort: postsSort,
      },
      { $skip: Number(queryRecords.skip) || 0 },
      { $limit: Number(queryRecords.limit) || 10 }, // default post number with 10
      {
        $lookup: {
          from: 'comments',
          localField: '_id', // post collection column
          foreignField: 'postId', // comments collection column
          let: {
            userId: '$userId',
          },
          pipeline: [
            { $sort: { createAt: -1 } }, // comments new -> old
            { $limit: 10 },
            {
              $addFields: {
                actions: {
                  $cond: [
                    {
                      // Post owner can do "edit", "delete" ;
                      // Visiter can do "hide"
                      $eq: [
                        '$$userId',
                        mongoose.Types.ObjectId(currentUser[idPath].toString()),
                      ],
                    },
                    ['edit', 'delete'],
                    ['hide'],
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'Users',
                localField: 'userId', // post collection column
                foreignField: '_id', // Users collection column
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      avatar: '$avatar.url',
                    },
                  },
                ],
                as: 'userId',
              },
            },
            { $unwind: '$userId' },
            {
              $project: {
                _id: 1,
                content: 1,
                userId: 1,
                createdAt: 1,
                actions: 1,
              },
            },
          ],
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'userId', // post collection column
          foreignField: '_id', // Users collection column
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1,
              },
            },
          ],
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
    ]);

    res.send({ status: true, data: postsData });
  },
  async getPost(req, res) {
    const post = await Post.find({ _id: req.params.id }).populate({
      path: 'userId',
      select: 'name avatar.url',
    }).populate({
      path: 'comments',
      select: 'content -postId',
    });
    // 無資料，回傳空陣列
    res.send({ status: true, data: post });
  },
  async postPost(req, res, next) {
    if (req.body.content === undefined) return appError(400, '需要 content 欄位', next);
    if (req.body.content === '') return appError(400, 'content 不能為空值', next);
    const data = {
      userId: req.user[idPath],
      content: req.body.content,
    };
    if (req?.files && req.files.length > 0) {
      data.image = await Imgur.upload(req.files);
    }
    const newPost = await Post.create({
      ...data,
    });
    return res.send({ status: true, data: newPost });
  },
  async patchPost(req, res, next) {
    const post = await Post.findById(req.params.id);
    if (!post) return appError(400, '無此貼文', next);
    if (req.body.content === undefined) return appError(400, '需要 content 欄位', next);
    if (req.body.content === '') return appError(400, 'content 不能為空值', next);
    const updatePost = await Post.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
    )
      .populate({
        path: 'userId',
        select: 'name avatar',
      });
    return res.send({ status: true, data: updatePost });
  },
  async deletePosts(req, res) {
    const postsData = await Post.deleteMany({});
    const comments = await Comment.deleteMany({});

    res.send({
      status: true,
      data: {
        deletePost: postsData,
        deleteComments: comments,
      },
    });
  },
  async deletePost(req, res) {
    const post = await Post.deleteOne({ _id: req.params.id });
    const comments = await Comment.deleteMany({
      postId: mongoose.Types.ObjectId(req.params.id),
    });
    const likes = await Like.updateMany({
      $pullAll: {
        posts: [{ _id: req.params.id }],
      },
    });
    res.send({
      status: true,
      data: {
        deletePost: post,
        deleteComments: comments,
        deleteLikes: likes,
      },
    });
  },
};

module.exports = posts;
