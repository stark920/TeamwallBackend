const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const { appError } = require('../service');

const idPath = '_id';
const docPath = '_doc';
// validate postId
const validatePostId = async (postId, next) => {
  if (!postId || postId.toString().length !== 24) {
    return appError(400, '查無此postId', next);
  }

  const post = await Post.findById(postId);
  if (!post) {
    return appError(400, '查無此postId', next);
  }

  return post;
};

// validate comment actions
const validateCommentActions = async (currentUserId, ownerId, data) => {
  // Post owner can do "edit", "delete" ;
  // Visiter can do "hide"
  let actions = ['hide'];
  if (currentUserId === ownerId) {
    // Post owner
    actions = ['delete', 'edit'];
  }

  const finalData = data.map((item) => {
    const modifiedItem = item;
    modifiedItem[docPath].actions = [...actions];
    return modifiedItem;
  });

  return finalData;
};

// main function
const commentController = {
  async getMoreComments(req, res, next) {
    // current user
    const currentUser = req.user;

    // validate postId
    const { postId } = req.params;
    const post = await validatePostId(postId, next);

    const currentUserId = currentUser[idPath].toString();
    const ownerId = post.userId.toString();

    // get comments
    const start = Number(req.query.start);
    const limit = Number(req.query.limit);
    const timeSort = req.query.timeSort === 'old' ? 1 : -1;
    let commentData = await Comment.find({ postId })
      .populate({
        path: 'userId',
        select: 'name avatar',
        options: {
          skip: start,
        },
      })
      .sort({
        createdAt: timeSort,
      })
      .skip(start)
      .limit(limit);

    // validate comment actions
    commentData = await validateCommentActions(currentUserId, ownerId, commentData);

    res.send({ status: true, data: commentData });
  },
  async postComments(req, res, next) {
    // current user
    const currentUser = req.user;

    // validate comments query body
    const { content } = req.body;
    if (content === undefined) return appError(400, '需要 content 欄位', next);
    if (content === '') return appError(400, 'content 不能為空值', next);

    // validate postId
    const { postId } = req.params;
    await validatePostId(postId, next);

    // create comment
    const newComment = await Comment.create({
      content,
      userId: currentUser,
      postId,
    });

    return res.send({ status: true, data: newComment });
  },
  async patchComment(req, res, next) {
    // current user
    const currentUser = req.user;

    const { content } = req.body;
    if (content === undefined) return appError(400, '需要 content 欄位', next);
    if (content === '') return appError(400, 'content 不能為空值', next);

    const { commentId } = req.params;

    const targetComment = await Comment.findById(commentId);
    if (!targetComment) return appError(400, '無此留言', next);

    // if current user does not own the comment, no right for editing
    const currentUserId = currentUser[idPath].toString();
    const ownerId = targetComment.userId[idPath].toString();
    if (currentUserId !== ownerId) {
      return appError(400, '無修改權限', next);
    }

    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { returnDocument: 'after' },
    );

    return res.send({ status: true, data: updateComment });
  },
  async deleteComment(req, res, next) {
    // current user
    const currentUser = req.user;

    const { commentId } = req.params;
    const targetComment = await Comment.findById(commentId);
    if (!targetComment) return appError(400, '無此留言', next);

    // if current user does not own the comment, no right for deletion
    const currentUserId = currentUser[idPath].toString();
    const ownerId = targetComment.userId[idPath].toString();
    if (currentUserId !== ownerId) {
      return appError(400, '無修改權限', next);
    }

    const deleteComment = await Comment.deleteOne({ _id: commentId });

    return res.send({ status: true, data: deleteComment });
  },
};

module.exports = commentController;
