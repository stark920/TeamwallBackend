const express = require('express');
const router = express.Router();
const Post = require('../models/postModel')
const Like = require('../models/likesModel')
const Imgur = require('../utils/imgur');
const upload = require('../service/upload');
const { successHandler, errorHandler } = require('../handler');
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");

router.get('/', handleErrorAsync(
  async (req, res) => {
    // http://localhost:3005/posts?timeSort=asc&search=
    const timeSort = req.query.timeSort == 'asc'? 1:-1
    const search = req.query.search? {"content": new RegExp(req.query.search)} : {}; 
    const posts =await Post.find(search).populate({
      path: 'userId',
      select: 'name photo'
    }).sort({'createAt': timeSort})
    res.status(200).json({status:"success", data:posts})
  }
));

router.post('/', upload.array('photos', 10),async (req, res) => {
  const data = req.body;
  const {userId, content} = data;
  if (userId !== undefined && content !== undefined) {
    if (req.files.length > 0) {
      data.image = await Imgur.upload(req.files)
    }
    const newPost = await Post.create({
      ...data,
    });
    successHandler(res, newPost);
  } else {
    errorHandler(res, '資料欄位未填寫', 400)
  }
});

module.exports = router;