const User = require('../models/userModel');
const uuid = require('uuid');
const { generateUrlJWT } = require('./auth');

const thirdPartySignIn = async (type, data, res) => {
  const { id, email, name, picture } = data;
  const key = `${type}Id`;

  // 先檢查email是否存在
  const userExisted = await User.findOne({ email }).select(
    `+${key} +activeStatus`
  );
  const limit = await User.count();
  if (!userExisted && limit >= 500) {
    res.sendFile(path.join(__dirname, '../public/emailLimitExceeded.html'));
    return;
  }

  let user;
  // 更新登入狀態或建立使用者資料
  if (userExisted) {
    // 已經有帳號
    let data;
    if (userExisted[key]) {
      // 已經有註冊
      data = { isLogin: true };
    } else {
      // 還沒註冊
      if (userExisted.activeStatus === 'none') {
        // 有使用一般註冊但尚未啟用
        data = { isLogin: true, activeStatus: 'third' };
      } else if (userExisted.activeStatus === 'meta') {
        // 有使用一般註冊且完成啟用
        data = { isLogin: true, activeStatus: 'both' };
      } else {
        // 有啟用第三方登入 或是 兩種登入方式都有啟用
        data = { isLogin: true };
      }
      data[key] = id;
    }
    await User.updateOne({ email }, data);
    user = userExisted;
  } else {
    // 沒有帳號
    const new_uuid = await uuid.v4();
    const password = await bcrypt.hash(new_uuid, 12);
    const createData = {
      email: email,
      name: name,
      avatar: {
        deleteHash: '',
        url: picture,
      },
      password,
      isLogin: true,
      activeStatus: 'third',
    };
    createData[key] = id;
    user = await User.create(createData);
  }
  generateUrlJWT(user, res);
};

module.exports = thirdPartySignIn;
