const uuid = require('uuid');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { generateUrlJWT } = require('./auth');

const thirdPartySignIn = async (type, data, res) => {
  const {
    id, email, name, picture,
  } = data;

  const key = `${type}Id`;

  const userExisted = await User.findOne({ email }).select(
    `+${key} +activeStatus`,
  );
  const limit = await User.count();
  if (!userExisted && limit >= 500) {
    res.sendFile(path.join(__dirname, '../public/emailLimitExceeded.html'));
    return;
  }

  let user;

  if (userExisted) {
    let userStateData;
    if (!userExisted[key]) {
      if (userExisted.activeStatus === 'none') {
        userStateData = { activeStatus: 'third' };
      } else if (userExisted.activeStatus === 'meta') {
        userStateData = { activeStatus: 'both' };
      }
      userStateData[key] = id;
    }
    await User.updateOne({ email }, userStateData);
    user = userExisted;
  } else {
    const randomPasswordBase = uuid.v4();
    const password = await bcrypt.hash(randomPasswordBase, 12);
    const createData = {
      email,
      name,
      avatar: {
        deleteHash: '',
        url: picture,
      },
      password,
      activeStatus: 'third',
    };
    createData[key] = id;
    user = await User.create(createData);
  }
  generateUrlJWT(user, res);
};

module.exports = thirdPartySignIn;
