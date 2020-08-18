const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const crypto=require('crypto');
const router = new Router();


router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.id);
    user.authentication_check=false;
    user.authentication=crypto.randomBytes(3).toString('hex').toUpperCase();
    user.save();
    delete req.session.id;
    return res.redirect('/staff');
}));

module.exports = router;