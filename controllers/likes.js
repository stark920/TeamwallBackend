const Post = require('../models/postModel');
const Like = require('../models/likesModel');
const handleErrorAsync = require("../service/handleErrorAsync");
const appError = require("../service/appError");

const likes = {
  getLikes:handleErrorAsync(
    async (req, res, next) => {
      const data = {
        userId: req.user._id,
      };
      if(!data.userId){
        return next(appError(400,"沒有使用者ID",next))
      }
      const likes = await Like.findOne({"userId": data.userId})
      .populate({
        path: 'userId',
        select: 'name avatar'
      }).populate({
        path: 'posts',
        select: 'name content createAt',
        populate: {
          path: 'userId',
          select: 'name avatar'
        }
      })
      res.status(200).json({status:true , data:likes})
    }
  ),
  postAndCancelLike:handleErrorAsync(
    async (req, res, next) => {
      const data = {
        userId: req.user._id,
        posts: req.body.posts
      };
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
          res.status(200).json({status:true, data:user})
        }else{ //收藏
          user.posts.unshift(data.posts) 
          user.save()
          changePostLikes(data)
          res.status(200).json({status:true, data:user})
        }
      }else{
        const newLike = await Like.create({
          userId: data.userId,
          posts: [data.posts],
        })
  
        changePostLikes(data)
        res.status(200).json({status:true, data:newLike})
      }
    }
  )
}

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

module.exports = likes;