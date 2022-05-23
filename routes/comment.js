const express = require('express')
const router = express.Router()
const commentController = require('../controllers/comments')
const {isAuth} = require('../service/auth')

router.get(
  /**
   *  #swagger.tags = ['Comments']
   *  #swagger.summary = '取得留言'
   *  #swagger.description = '如為登入狀態，回傳指定文章ID的留言'
   *  #swagger.parameters['postId'] = {
        in: 'path',
        description: '文章ID',
      }
   *  #swagger.parameters['start'] = {
        in: 'query',
        description: '起始資料，ex: start=2，從第三筆comments到最後一筆',
      }
   *  #swagger.parameters['limit'] = {
        in: 'query',
        description: '一次拿幾筆資料',
      }
   *  #swagger.parameters['timeSort'] = {
        in: 'query',
        description: 'timeSort=asc (舊到新) or (新到舊)',
      }
   *  #swagger.security = [{ apiKeyAuth: []}] 
   *  #swagger.responses[200] = {
        description: "取得貼文資料",
        schema: {
          status: "success",
          data: [
            {
              "_id": "628a0c089acb6cb7d6b70da6",
              "content": "我只是個測試唷 - 回應4",
              "postId": "628a0aea9acb6cb7d6b70d93",
              "userId": {
                "_id": "6286d9983208cb01aafaa562",
                "name": "Meme",
              },
              "createAt": "2022-05-22T10:10:16.925Z",
              "actions": [
                "delete",
                "edit",
              ]
            },
          ]
        }
      }
   *  #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: 'fail',
          message: '錯誤訊息'
        }
      }
   */
  '/:postId',
  isAuth,
  commentController.getMoreComments
)

router.post(
  /**
   * #swagger.tags = ['Comments']
   * #swagger.summary = '新增留言'
   * #swagger.description = '登入狀態，並且有文章ID 才可以新增留言'
   * #swagger.parameters['postId'] = {
      in: 'path',
      description: '文章ID',
    }
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '回傳新增的留言',
        schema: {
          "status": "success",
          "data": {
            "content": "我只是個測試唷 - 回應4",
            "postId": "628a0aea9acb6cb7d6b70d93",
            "userId": {
              "_id": "6286d9983208cb01aafaa562",
              "name": "Meme",
              "isLogin": true,
              "createdAt": "2022-05-19T23:58:16.938Z",
              "chatRecord": []
            },
            "_id": "628a0c089acb6cb7d6b70da6",
            "createAt": "2022-05-22T10:10:16.925Z"
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
  '/:postId',
  isAuth,
  commentController.postComments
)

router.patch(
  /**
   *  #swagger.tags = ['Comments']
   *  #swagger.summary = '修改留言'
   *  #swagger.description = '如為登入狀態，且為留言的擁有者，才可以修改留言'
   *  #swagger.parameters['commentId'] = {
        in: 'path',
        description: '留言ID',
      }
   *  #swagger.parameters['body'] = {
        in: 'body',
        description: '留言內容',
        schema: {
          content: '更新的留言'
        }
      }
   *  #swagger.security = [{ apiKeyAuth: []}] 
   *  #swagger.responses[200] = {
        description: "修改後的comment",
        schema: {
          status: "success",
          data: {
            "_id": "6289f7048311166ba6134a0f",
            "content": "測試1 - 修改過了唷!!!",
            "postId": "62897d87b523932b81580581",
            "userId": "6286d9983208cb01aafaa562",
            "createAt": "2022-05-22T08:40:36.456Z"
          }
        }
      }
   *  #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: 'fail',
          message: '錯誤訊息'
        }
      }
   */
  '/:commentId',
  isAuth,
  commentController.patchComment
)

router.delete(
  /**
   *  #swagger.tags = ['Comments']
   *  #swagger.summary = '刪除一則留言'
   *  #swagger.description = '如為登入狀態，且為留言的擁有者，才可以刪除留言'
   *  #swagger.parameters['commentId'] = {
        in: 'path',
        description: '留言ID',
      }
   *  #swagger.security = [{ apiKeyAuth: []}] 
   *  #swagger.responses[200] = {
        description: "修改後的comment",
        schema: {
          status: "success",
          data: {
            "_id": "6289f7048311166ba6134a0f",
            "content": "測試1 - 修改過了唷!!!",
            "postId": "62897d87b523932b81580581",
            "userId": "6286d9983208cb01aafaa562",
            "createAt": "2022-05-22T08:40:36.456Z"
          }
        }
      }
   *  #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: 'fail',
          message: '錯誤訊息'
        }
      }
   */
  '/delete/:commentId',
  isAuth,
  commentController.deleteComment
)

module.exports = router