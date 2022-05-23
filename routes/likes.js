const express = require('express');
const router = express.Router();
const likesControl = require('../controllers/likes');
const { isAuth } = require('../service');

// 查詢
router.get(
  /**
   * #swagger.tags = ['Likes']
   * #swagger.summary = '取得某人喜愛貼文'
   * #swagger.description = '如為登入狀態，回傳所有喜愛貼文'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        userId: 'jwt 所取得的 id',
      }
    }
   * #swagger.responses[200] = {
        description: '取得某人所有喜愛貼文',
        schema: {
          status: true,
          data: {
            _id: 'xxxxxx',
            userId: {
              _id: '此處會是使用者 id',
              name: 'Meme'
            },
            posts: [
              {
                _id: 'xxxxxx',
                userId: {
                  _id: '此處會是那篇創作者 id',
                  name: '六角超人'
                },
                content: '這是一段話',
                createAt: '2022-05-22T03:18:26.158Z'
              }
            ]
          }
        }
      }
   * #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/', isAuth, likesControl.getLikes);

//新增-移除
router.post(
  /**
   * #swagger.tags = ['Likes']
   * #swagger.summary = '收藏/取消 喜愛貼文'
   * #swagger.description = '如為登入狀態，下點擊後收藏/取消 喜愛貼文'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        userId: 'jwt 所取得的 id',
        posts: '點擊的那篇貼文 id'
      }
    }
   * #swagger.responses[200] = {
        description: '取得某人所有喜愛貼文',
        schema: {
          status: true,
          data: {
            _id: 'xxxx',
            userId: '此處會是使用者 id',
            posts: [
              '此處會是收藏的貼文 id'
            ]
          }
        }
      }
   * #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/likePost', isAuth, likesControl.postAndCancelLike);


module.exports = router;
