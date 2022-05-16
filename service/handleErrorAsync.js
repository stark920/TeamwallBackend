const handleErrorAsync = (func) => async (req, res, next) => {
  func(req, res, next).catch((error) => next(error));
};

module.exports = handleErrorAsync;
