const express = require('express');
const router = express.Router();
const upload = require('../service/upload');
const postsControl = require("../controllers/posts");
const { isAuth } = require("../service/auth");

// 取得所有貼文
router.get(
  /**
   * #swagger.tags = ['Posts']
   * #swagger.summary = '取得所有貼文'
   * #swagger.description = '如為登入狀態，回傳所有貼文'
   * #swagger.parameters['search'] = {
      in: 'query',
      description: 'search=',
    }
   * #swagger.parameters['timeSort'] = {
      in: 'query',
      description: 'timeSort=asc (舊到新) or (新到舊)',
    }
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '取得所有貼文資料',
        schema: {
          status: true,
          data: {
            _id: '',
            userId: {
              _id: '',
              name: ''
            },
            content: '',
            imgage: [],
            likes: [],
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
  '/', isAuth, postsControl.getPosts);
router.get(
  /**
   * #swagger.tags = ['Posts']
   * #swagger.summary = '取得單筆貼文'
   * #swagger.description = '如為登入狀態，回傳單筆貼文'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '取得單筆貼文資料',
        schema: {
          status: true,
          data: {
            _id: '',
            userId: {
              _id: '',
              name: ''
            },
            content: '',
            imgage: [],
            likes: [],
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
  '/:id', isAuth, postsControl.getPost);
router.post(
  /**
   * #swagger.tags = ['Posts']
   * #swagger.summary = '新增單筆貼文'
   * #swagger.description = '如為登入狀態，可新增單筆貼文'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.parameters['body'] = {
      in: 'body',
      description: 'formdata 資料格式',
      schema: {
        userId: 'jwt 所取得的 id',
        content: '測試貼文'
      }
    }
   * #swagger.responses[200] = {
        description: '取得單筆貼文資料',
        schema: {
          status: true,
          data: {
            _id: '',
            userId: {
              _id: '',
              name: ''
            },
            content: '',
            imgage: [],
            likes: [],
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
  '/', isAuth, upload.array('photos', 10), postsControl.postPost);
router.patch(
  /**
   * #swagger.tags = ['Posts']
   * #swagger.summary = '更新單筆貼文'
   * #swagger.description = '如為登入狀態，可更新單筆貼文'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        content: '更新貼文',
        image: [],
        likes: [],
      }
    }
   * #swagger.responses[200] = {
        description: '取得單筆貼文資料',
        schema: {
          status: true,
          data: {
            _id: '',
            userId: {
              _id: '',
              name: ''
            },
            content: '',
            imgage: [],
            likes: [],
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
  '/:id', isAuth, postsControl.patchPost);
router.delete(
  /**
   * #swagger.tags = ['Posts']
   * #swagger.summary = '刪除單筆貼文'
   */
  '/delete/:id', isAuth, postsControl.deletePost);

// ＊＊＊測試用＊＊＊ 刪除所有貼文資料
router.delete(
  /**
   * #swagger.tags = ['Posts ＊＊＊測試用＊＊＊']
   * #swagger.summary = '刪除所有貼文'
   */
  '/deleteAll', postsControl.deletePosts);

module.exports = router;