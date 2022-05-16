const appError = require("../service/appError");

const requiredBody = {
  user: ["name", "email", "password"],
  post: ["user", "content"],
};

const roles = {
  checkBody(name, data, next) {
    let result = false;
    // body 是否為物件
    if (data instanceof Array && typeof data === 'object') {
      appError(400, '傳入資料需為物件', next);
      return result
    }
    // body 是否缺少欄位名稱或空值
    requiredBody[name].forEach((item) => {
      if (data[item] === undefined) {
        appError(400, `「${item}」為必要欄位`, next);
        result = false;
      } else if (data[item] === "" || data[item].length === 0) {
        appError(400, `「${item}」不能為空值`, next);
        result = false;
      } else {
        result = true;
      }
    });
    return result
  },
};

module.exports = roles;
