const {successHandler} = require('../handler')
const Comment = require('../models/commentModel')
const Post = require('../models/postModel')
const {appError, roles, handleErrorAsync} = require('../service')

// validate postId
const validatePostId = async (postId, next) => {
  if(!postId) return appError(400, '查無此postId', next)

  const post = await Post.find({_id: postId})
  if (!post) {
    return appError(400, '查無此postId', next)
  }

  return post
}

// validate comment actions
const validateCommentActions = async(currentUserId, ownerId, data) => {
  // Post owner can do "edit", "delete" ;
  // Visiter can do "hide"
  let actions = ['hide']
  if (currentUserId === ownerId) {
    // Post owner
    actions = ['delete', 'edit']
  }

  const finalData = data.map(item => {
    item._doc.actions = [...actions]
    return item
  })

  return finalData
}

// main function
const commentController = {
  getMoreComments: handleErrorAsync(async (req, res, next) => {
    // current user
    const currentUser = req.user

    // validate postId
    const postId = req.params.postId
    const post = await validatePostId(postId, next)

    const currentUserId = currentUser._id.toString()
    const ownerId = post[0].userId.toString()

    // get comments
    const start = Number(req.query.start)
    const limit = Number(req.query.limit)
    const timeSort = req.query.timeSort == 'asc' ? 1 : -1
    let commentData = await Comment.find({postId})
      .populate({
        path: 'userId',
        select: 'name avatar',
        options: {
          skip: start,
        },
      })
      .sort({
        createAt: timeSort,
      })
      .skip(start)
      .limit(limit)

    // validate comment actions
    commentData = await validateCommentActions(currentUserId, ownerId, commentData)
    
    successHandler(res, commentData)
  }),
  postComments: handleErrorAsync(async (req, res, next) => {
    // current user
    const currentUser = req.user

    // validate comments query body
    const data = req.body
    if (!roles.checkBody('comment', data, next)) return

    // validate postId
    const postId = req.params.postId
    await validatePostId(postId, next)

    // create comment
    const newComment = await Comment.create({
      ...data,
      userId: currentUser,
      postId,
    })

    successHandler(res, newComment)
  }),
  patchComment: handleErrorAsync(async (req, res, next) => {
    // current user
    const currentUser = req.user

    const {content} = req.body
    if (content === undefined) return appError(400, '需要 content 欄位', next)
    if (content === '') return appError(400, 'content 不能為空值', next)

    const {commentId} = req.params

    const targetComment = await Comment.findById(commentId)
    if (!targetComment) return appError(400, '無此留言', next)

    // if current user does not own the comment, no right for editting
    const currentUserId = currentUser._id.toString()
    const ownerId = targetComment.userId.toString()
    if (currentUserId !== ownerId) {
      return appError(400, '無修改權限', next)
    }

    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      {content},
      {returnDocument: 'after'}
    )

    successHandler(res, updateComment)
  }),
  deleteComment: handleErrorAsync(async (req, res, next) => {
    // current user
    const currentUser = req.user

    const {commentId} = req.params
    const targetComment = await Comment.findById(commentId)
    if (!targetComment) return appError(400, '無此留言', next)

    // if current user does not own the comment, no right for deletion
    const currentUserId = currentUser._id.toString()
    const ownerId = targetComment.userId.toString()
    if (currentUserId !== ownerId) {
      return appError(400, '無修改權限', next)
    }

    const deleteComment = await Comment.deleteOne({_id: commentId})

    successHandler(res, deleteComment)
  }),
}

module.exports = commentController