const express = require('express');
const router = express.Router();
const User = require('../models/userModel')
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");

/* GET users listing. */
router.get('/', handleErrorAsync(
  async (req, res) => {
    const users =await User.find({});
    res.status(200).json({status:"success", data:users})
  }
));

module.exports = router;
