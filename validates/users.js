const { body, param } = require('express-validator');

const v = {
  email: body('email')
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .isEmail()
    .bail()
    .toLowerCase()
    .normalizeEmail(),
  password: body('password')
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .custom((value) => value.indexOf(' ') === -1)
    .bail()
    .isLength({ min: 8, max: 20 }),
  name: body('name')
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .isLength({ min: 2, max: 10 })
    .bail()
    .trim(),
  gender: body('gender')
    .not()
    .isEmpty()
    .bail()
    .custom((value) => 'male,female,others'.indexOf(value) > -1),
  passwordConfirm: body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password),
  profileId: param('id')
    .isMongoId()
};

const userValidator = {
  signUp: [v.email, v.password, v.name],
  signIn: [v.email, v.password],
  updateProfile: [v.name, v.gender],
  updatePassword: [v.password, v.passwordConfirm],
  getProfile: [v.profileId]
};

module.exports = userValidator;
