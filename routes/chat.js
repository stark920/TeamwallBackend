const router = require('express').Router();
const chatController = require('../controllers/chats');
const { isAuth, handleErrorAsync } = require('../service');

// 取得聊天記錄
router.get(
  '/chat-record',
  isAuth,
  /**
   *  #swagger.tags = ['Chats']
   *  #swagger.summary = '取得聊天紀錄'
   *  #swagger.description = '如為登入狀態，回傳聊天紀錄'
   *  #swagger.security = [{ apiKeyAuth: []}]
   *  #swagger.responses[200] = {
        description: "取得聊天紀錄",
        schema: {
          status: true,
          chatRecord: [
            {
              "message": [
                  {
                      "message": "我跟你說拉",
                      "sender": "629184780ccb3bf0b3f8a651",
                      "createdAt": "2022-06-04T08:12:41.870Z",
                      "_id": "629b13f90710d468849ff9ae"
                  }
              ],
              "avatar": {
                  "deleteHash": "ks49Hx06QixMhan",
                  "url": "https://i.imgur.com/XnOhDAC.png"
              },
              "name": "joe001",
              "roomId": "62918bd00ccb3bf0b3f8a6b4"
            },
          ]
        }
      }
   *  #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  handleErrorAsync(chatController.getChatRecord),
);

router.post(
  '/room-info',
  isAuth,
  /**
   *  #swagger.tags = ['Chats']
   *  #swagger.summary = '取得聊天室id'
   *  #swagger.description = '聊天室如果已存在會直接回傳房間ID，沒有的會建立一個新的房間ID'
   *  #swagger.security = [{ apiKeyAuth: []}]
   *  #swagger.parameters['body'] = {
        in: 'body',
        description: '聊天對象的userID',
        schema: {
          receiver:'629184900ccb3bf0b3f8a655'
        }
      }
   *  #swagger.responses[200] = {
        description: "取得聊天室id",
        schema: {
          "status": true,
          "roomId": "6299b03565105f86cb05f1ad",
          "name": "Genos",
          "avatar": {
              "deleteHash": "EwnsACnMELyxgdC",
              "url": "https://i.imgur.com/DVgUANY.jpg"
          },
          "_id": "6298b4c1a07f92d7cf6bd69b"
        }
      }
   *  #swagger.responses[400] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  handleErrorAsync(chatController.postRoomInfo),
);

router.delete(
  '/chat-record',
  isAuth,
  /**
   * #swagger.tags = ['Chats ＊＊＊測試用＊＊＊']
   * #swagger.summary = '刪除所有聊天記錄'
   */
  handleErrorAsync(chatController.deleteChatRecord),
);

router.delete(
  '/room-record',
  isAuth,
  /**
   * #swagger.tags = ['Chats ＊＊＊測試用＊＊＊']
   * #swagger.summary = '刪除所有使用者聊天房間'
   */
  handleErrorAsync(chatController.deleteRoomRecord),
);
module.exports = router;
