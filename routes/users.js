const express = require('express');

const router = express.Router();
const passport = require('passport');
const cors = require('cors');
const userValidator = require('../validator/users');
const userControl = require('../controllers/users');
const { isAuth, upload, handleErrorAsync } = require('../service');

// 登入權限測試
router.get(
  '/check',
  isAuth,
  cors({ exposedHeaders: 'Authorization' }),
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
  handleErrorAsync(userControl.check),
);

// 登入會員
router.post(
  '/sign-in',
  cors({ exposedHeaders: 'Authorization' }),
  userValidator.signIn,
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
  handleErrorAsync(userControl.signIn),
);

// 註冊會員
router.post(
  '/sign-up',
  userValidator.signUp,
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
  handleErrorAsync(userControl.signUp),
);

// 檢查註冊信
router.get('/checkCode', handleErrorAsync(userControl.checkCode));

// 檢查註冊信
router.post('/forget-password', userValidator.email, handleErrorAsync(userControl.forgetPassword));

// 更新使用者資料
router.patch(
  '/profile',
  isAuth,
  upload.single('avatar'),
  userValidator.updateProfile,
  /**
   * #swagger.auto = false
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
        description: '暱稱'
      }
   * #swagger.parameters['gender'] = {
        in: 'formData',
        type: 'string',
        schema: {
          '@enum': ['male', 'female', 'others']
        },
        require: 'true',
        description: '性別(male, female, others)'
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
  handleErrorAsync(userControl.updateProfile),
);

// 更新使用者密碼
router.patch(
  '/profile/pwd',
  isAuth,
  userValidator.updatePassword,
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
  handleErrorAsync(userControl.updatePassword),
);

// google登入
router.get('/google', passport.authenticate('google', {
  scope: ['email', 'profile'],
}));
// google callback
router.get('/google/callback', passport.authenticate('google', {
  session: false,
}), handleErrorAsync(userControl.google));

// facebook登入
router.get('/facebook', passport.authenticate('facebook'));
// facebook callback
router.get('/facebook/callback', passport.authenticate('facebook', {
  session: false,
}), handleErrorAsync(userControl.facebook));

// discord登入
router.get('/discord', passport.authenticate('discord'));
// discord callback
router.get('/discord/callback', passport.authenticate('discord', {
  session: false,
}), handleErrorAsync(userControl.discord));

// 取得追蹤名單
router.get(
  '/follows',
  isAuth,
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '取得追蹤名單'
   */
  handleErrorAsync(userControl.getFollows),
);

// 新增追蹤
router.post(
  '/:id/follow',
  isAuth,
  /**
   * #swagger.tags = ['Users']
   * #swagger.summary = '新增追蹤名單'
   */
  handleErrorAsync(userControl.postFollow),
);

// 刪除追蹤
router.delete(
  '/:id/follow',
  isAuth,
  /**
   * #swagger.tags = ['Users ＊＊＊測試用＊＊＊']
   * #swagger.summary = '刪除追蹤名單'
   */
  handleErrorAsync(userControl.deleteFollow),
);

// 取得指定用戶資訊
router.get(
  '/:id',
  isAuth,
  userValidator.getProfile,
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
  handleErrorAsync(userControl.getProfile),
);

module.exports = router;
