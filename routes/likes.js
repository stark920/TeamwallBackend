const express = require('express');
const router = express.Router();
const Post = require('../models/postModel')
const Like = require('../models/likesModel')
const { successHandler, errorHandler } = require('../handler');

// 查詢
router.post('/', async (req, res) => {
  try{
    const data = req.body
    if(!data.userInfo ){
      throw '使用者Id缺一不可'
    }

    const likes = await Like.findOne({"userInfo": data.userInfo})
    .populate({ //此是先將userInfo 編譯
      path: 'userInfo',
      select: 'name photo'
    }).populate({ //此是先將posts 編譯
      path: 'posts',
      select: 'name content createAt'
    })

    successHandler(res, likes)
  }catch(error){
    errorHandler(res,error,400)
  }
});

//新增-移除
router.post('/likePost', async (req, res) => {
  try{
    const data = req.body
    if(!data.userInfo || !data.posts ){
      throw '使用者Id、喜歡文章Id、缺一不可'
    }

    const user = await Like.findOne({"userInfo": data.userInfo})

    if(user){
      if(user.posts.includes(data.posts)){ //移除
        const postsIndex = user.posts.indexOf(data.posts)
        user.posts.splice(postsIndex, 1) 
        user.save()

        changePostLikes(data)
        successHandler(res, user)
      }else{ //收藏
        user.posts.unshift(data.posts) 
        user.save()

        changePostLikes(data)
        successHandler(res, user)
      }
    }else{
      const newLike = await Like.create({
        userInfo: data.userInfo,
        posts: [data.posts],
      })

      changePostLikes()
      successHandler(res, newLike)
    }
  }catch(error){
    errorHandler(res,error,400)
  }
});

async function changePostLikes(data){
  const post = await Post.findOne({"_id": data.posts})
  const likesIndex = post.likes.indexOf(data.userInfo)
  if(likesIndex){
    post.likes.splice(likesIndex, 1) 
    post.save()
  }else{
    post.likes.unshift(data.userInfo) 
    post.save()
  }
}

router.delete('/', async (req, res) => {
  try{
    await Like.deleteMany({});
    successHandler(res, [])
  }catch(error){
    errorHandler(res,error,400)
  }
});

router.delete('/:id', async (req, res) => {
  try{
    const id = req.params.id;
    const resultUser = await User.findByIdAndDelete(id);
    if(resultUser == null){
      throw '查無此id'
    }
    const users =await User.find({});
    successHandler(res, users)
  }catch(error){
    errorHandler(res,error,400)
  }
});

module.exports = router;
