const express = require('express');
const router = express.Router();
const Post = require('../models/postModel')
const Like = require('../models/likesModel')
const { successHandler, errorHandler } = require('../handler');


router.get('/', async (req, res) => {
  // http://localhost:3005/posts?timeSort=asc&search=
  const timeSort = req.query.timeSort == 'asc'? 1:-1
  const search = req.query.search? {"content": new RegExp(req.query.search)} : {}; 
  try{
    const posts =await Post.find(search).populate({ //此是先將name編譯,可以不編譯只算長度
      path: 'userInfo',
      select: 'name photo'
    }).sort({'createAt': timeSort})  //.sort(timeSort)
    successHandler(res, posts)
  }catch(error){
    errorHandler(res,error,400)
  }
});

module.exports = router;