const multer = require('multer');

const upload = multer({
  fileFilter: (req, file, callback) => {
    const fileSize = parseInt(req.headers['content-length'], 10);
    const error = new Error();
    error.isOperational = true;
    if (fileSize >= 2 * 1024 * 1024) {
      error.message = '檔案需在 2 MB 內';
      return callback(error);
    }
    if (
      file.mimetype === 'image/jpeg'
      || file.mimetype === 'image/jpg'
      || file.mimetype === 'image/png'
    ) {
      callback(null, true);
    } else {
      error.message = '檔案格式必須為 .jpg 、 .jpeg 或 .png';
      return callback(error);
    }
    return callback(null, true);
  },
});

module.exports = upload;
