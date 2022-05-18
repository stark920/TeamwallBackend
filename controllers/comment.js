const {handleSuccess} = require('../handler')
const Comment = require('../models/commentModel')
const Post = require('../models/postModel')
const Like = require('../models/likesModel')
const appError = require('../service/appError')
const Imgur = require('../utils/imgur')
const roles = require('../service/roles')

const comment = {
  async getComments(req, res, next) {
    const userId = req.params.id
    const postId = req.params.postId

    const comments = await Comment.find()

    
    const posts = await Post.find(search)
      .populate({
        path: 'userId',
        select: 'name photo',
      })
      .sort({createAt: timeSort})
    handleSuccess(res, posts)
  },
  async postComments(req, res, next) {
    // validate comments query body
    const data = req.body
    if (!roles.checkBody('comment', data, next)) return

    // validate postId
    const postId = req.params.postId
    const validatePostId = await Post.find(postId)
    if(validatePostId) {
      const newComment = await Comment.create({...data})
      handleSuccess(res, newComment)
    } else {
      // postId 不存在
    }
  },
}
