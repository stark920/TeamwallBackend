const express = require('express');
const router = express.Router();
const User = require('../models/userModel')
const { successHandler, errorHandler } = require('../handler');
/* GET users listing. */
router.get('/', async (req, res) => {
  try{
    const users =await User.find({});
    successHandler(res, users)
  }catch(error){
    errorHandler(res,error,400)
  }
});

module.exports = router;
