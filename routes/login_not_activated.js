const {Router}=require('express');
const User=require('../services/user');
const asyncHandler=require('express-async-handler');
const { body, validationResult } = require('express-validator');

const router = new Router();
router.get('/', asyncHandler(async function (req,res){
    return res.render('login_not_activated');
}));

module.exports = router;

