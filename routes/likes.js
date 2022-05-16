const express = require('express');
const router = express.Router();
const Post = require('../models/postModel')
const Like = require('../models/likesModel')
const { successHandler, errorHandler } = require('../handler');
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
// 查詢
router.post('/', handleErrorAsync(
  async (req, res) => {
    const data = req.body
    if(!data.userId){
      return next(appError(400,"你沒有使用者ID",next))
    }
    const likes = await Like.findOne({"userId": data.userId})
    .populate({
      path: 'userId',
      select: 'name photo'
    }).populate({
      path: 'posts',
      select: 'name content createAt',
      populate: {
        path: 'userId',
        select: 'name photo'
      }
    })
    res.status(200).json({status:"success", data:likes})
  }
));

//新增-移除
router.post('/likePost', handleErrorAsync(
  async (req, res, next) => {
    const data = req.body
    if(!data.userId){
      return next(appError(400,"你沒有使用者ID",next)) // 統一由express
    }
    if(!data.posts ){
      return next(appError(400,"你沒有輸入喜愛多文章",next))
    }
    const user = await Like.findOne({"userId": data.userId})

    if(user){
      if(user.posts.includes(data.posts)){ //移除
        const postsIndex = user.posts.indexOf(data.posts)
        user.posts.splice(postsIndex, 1) 
        user.save()

        changePostLikes(data)
        res.status(200).json({status:"success", data:user})
      }else{ //收藏
        user.posts.unshift(data.posts) 
        user.save()
        changePostLikes(data)
        res.status(200).json({status:"success", data:user})
      }
    }else{
      const newLike = await Like.create({
        userId: data.userId,
        posts: [data.posts],
      })

      changePostLikes(data)
      res.status(200).json({status:"success", data:newLike})
    }
  }
));

async function changePostLikes(data){
  const post = await Post.findOne({"_id": data.posts})
  const likesIndex = post.likes.indexOf(data.userId)
  if(likesIndex !== -1){
    post.likes.splice(likesIndex, 1) 
    post.save()
  }else{
    post.likes.unshift(data.userId) 
    console.log(data.userId)
    post.save()
  }
}

router.delete('/', handleErrorAsync(
  async (req, res) => {
    await Like.deleteMany({});
    res.status(200).json({status:"success", data:[]})
  }
));

router.delete('/:id', handleErrorAsync(
  async (req, res, next) => {
    const id = req.params.id;
    const resultUser = await User.findByIdAndDelete(id);
    if(resultUser == null){
      return next(appError(400,"沒有此使用者喔",next)) 
    }
    const users =await User.find({});
    res.status(200).json({status:"success", data:users})
  }
));

module.exports = router;
