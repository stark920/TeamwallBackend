const express = require('express');
const router = express.Router();
const upload = require('../service/upload');
const handleErrorAsync = require("../service/handleErrorAsync");
const PostsControllers = require("../controllers/posts");
const { isAuth } = require("../service/auth");

router.get('/', isAuth, handleErrorAsync((req, res, next) => PostsControllers.getPosts(req, res, next)));
router.post('/', isAuth, upload.array('photos', 10), handleErrorAsync((req, res, next) => PostsControllers.postPost(req, res, next)));
router.patch('/:id', isAuth, handleErrorAsync((req, res, next) => PostsControllers.patchPost(req, res, next)));

module.exports = router;