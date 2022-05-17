const express = require('express');
const router = express.Router();
const upload = require('../service/upload');
const postsControl = require("../controllers/posts");
const { isAuth } = require("../service/auth");

router.get('/', isAuth, postsControl.getPosts);
router.get('/:id', isAuth, postsControl.getPost);
router.post('/', isAuth, upload.array('photos', 10), postsControl.postPost);
router.patch('/:id', isAuth, postsControl.patchPost);
router.delete('/delete/:id', isAuth, postsControl.deletePost);

// ＊＊＊測試用＊＊＊ 刪除所有貼文資料
router.delete('/deleteAll', postsControl.deletePosts);

module.exports = router;