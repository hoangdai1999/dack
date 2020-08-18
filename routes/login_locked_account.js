const {Router}=require('express');
const User=require('../services/user');
const asyncHandler=require('express-async-handler');
const { body, validationResult } = require('express-validator');

const router = new Router();
router.get('/login_locked_account', asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
    if(req.session.userId){
        if(user.staff==true){
            return res.redirect('/staff');
        }
        if(user.authentication!=null){
            req.session.id=req.session.userId;
            delete req.session.userId;
            return res.redirect('/login_authentication');
        }
        if(user.lock==true){
            delete req.session.userId;
            return res.render('login_locked_account');
        }
        return res.redirect('/customer');
    }
    else {
        return res.render('login_locked_account');
    }
}));

module.exports = router;