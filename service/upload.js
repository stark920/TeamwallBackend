const multer = require('multer');

const upload = multer({
  fileFilter: (req, file, callback) => {
    const fileSize = parseInt(req.headers['content-length']);
    const error = new Error();
    error.isOperational = true;
    if (fileSize >= 10485760) {
      error.message = '檔案需在 10 MB 內';
      return callback(error);
    };
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      callback(null, true);
    } else {
      error.message = '檔案必須為 .jpg 或 .jpeg 或 .png';
      return callback(error);
    };
    callback(null, true);
  }
});

module.exports = upload;