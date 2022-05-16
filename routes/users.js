const express = require('express');
const router = express.Router();
const userValidator = require('../validates/users');
const userControl = require('../controllers/users');
const { isAuth, upload } = require('../service');

// 登入權限測試
router.get(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '登入權限測試'
   * #swagger.description = '如為登入狀態，回傳使用者資訊'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '取得使用者資訊',
        schema: {
          status: true,
          data: {
            name: '',
            avatar: ''
          }
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/check',
  isAuth,
  userControl.check
);

// 登入會員
router.post(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '登入會員'
   * #swagger.description = '密碼限制 8~20 字元'
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        email: 'abc123@abc.ab',
        password: '12345678'
      }
    }
   * #swagger.responses[200] = {
        description: '登入成功時，回傳 headers 中會帶有 token',
        schema: {
          status: true,
          message: '登入成功'
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/sign-in',
  userValidator.signIn,
  userControl.signIn
);

// 登出會員
router.delete(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '登出會員'
   * #swagger.description = '無需夾帶資料，需要檢查 token'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '修改登入狀態為 false',
        schema: {
          status: true,
          message: '登出成功'
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤原因'
        }
      }
   */
  '/sign-out',
  isAuth,
  userControl.signOut
);

// 註冊會員
router.post(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '註冊會員'
   * #swagger.description = '暱稱限制 2~10 字元，密碼限制 8~20 字元'
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        name: 'Meme',
        email: 'abc123@abc.ab',
        password: '12345678'
      }
    }
   * #swagger.responses[200] = {
        description: '註冊後，需要登入才能拿token，修改登入狀態',
        schema: {
          status: true,
          message: '註冊成功'
        }
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/sign-up',
  userValidator.signUp,
  userControl.signUp
);

// 更新使用者資料
router.patch(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '更新使用者資料'
   * #swagger.description = '夾帶圖片時需使用 FormData 格式'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.consumes = ['multipart/form-data']  
   * #swagger.parameters['avatar'] = {
        in: 'formData',
        type: 'file',
        description: '上傳頭像'
      }
   * #swagger.parameters['name'] = {
        in: 'formData',
        type: 'string',
        require: 'true',
        description: '暱稱(如果不夾帶圖片，只修改暱稱，可以用json傳)'
      }
   * #swagger.responses[200] = {
        description: '取得使用者資訊',
        message: '更新成功'
      }
   * #swagger.responses[401] = {
        description: '回傳錯誤訊息',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/profile',
  isAuth,
  upload.single('avatar'),
  userValidator.updateProfile,
  userControl.updateProfile
);

// 更新使用者密碼
router.patch(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '修改密碼'
   * #swagger.description = '密碼限制 8~20 字元'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.parameters['body'] = {
      in: 'body',
      description: '資料格式',
      schema: {
        password: '12345678',
        passwordConfirm: '12345678',
      }
    }
   * #swagger.responses[200] = {
        description: '修改成功',
        schema: {
          status: true,
          message: '修改成功'
        }
      }
   * #swagger.responses[401] = {
        description: '修改失敗',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/profile/pwd',
  isAuth,
  userValidator.updatePassword,
  userControl.updatePassword
);

// 取得指定用戶資訊
router.get(
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '取得指定用戶資訊'
   * #swagger.description = '需要用戶 Id'
   * #swagger.security = [{ apiKeyAuth: []}]
   * #swagger.responses[200] = {
        description: '取得成功',
        schema: {
          status: true,
          data: {}
        }
      }
   * #swagger.responses[401] = {
        description: '取得失敗',
        schema: {
          status: false,
          message: '錯誤訊息'
        }
      }
   */
  '/:id',
  isAuth,
  userValidator.getProfile,
  userControl.getProfile
);

// ＊＊＊測試用＊＊＊ 取得所有會員資料
router.get(
  /**
   * #swagger.tags = ['Users ＊＊＊測試用＊＊＊']
   * #swagger.summary = '取得所有會員資料'
   */
  '/',
  userControl.getAllUsers
);

// ＊＊＊測試用＊＊＊ 刪除所有會員資料
router.delete(
  /**
   * #swagger.tags = ['Users ＊＊＊測試用＊＊＊']
   * #swagger.summary = '刪除所有會員資料'
   */
  '/',
  userControl.delAllUsers
);

module.exports = router;
