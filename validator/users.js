const { body, param } = require('express-validator');

const rules = {
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
    .isMongoId(),
};

const userValidator = {
  signUp: [rules.email, rules.password, rules.name],
  signIn: [rules.email, rules.password],
  updateProfile: [rules.name, rules.gender],
  updatePassword: [rules.password, rules.passwordConfirm],
  getProfile: [rules.profileId],
};

module.exports = userValidator;
