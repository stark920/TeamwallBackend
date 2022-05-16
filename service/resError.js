const resError = {
  // 正式環境錯誤
  prod(err, res) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        message: err.message
      });
    } else {
      console.error('出現重大錯誤', err);
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請洽系統管理員'
      });
    }
  },
  // 開發環境錯誤
  dev(err, res) {
    res.status(err.statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
}