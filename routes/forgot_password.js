const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const crypto=require('crypto');
const User=require('../services/user');
const Email=require('../services/email');

const router = new Router();

var errors=[];

router.get('/', asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId)
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
            return res.redirect('login_locked_account');
        }
        return res.redirect('/customer');
    }
    else {
        if(!req.session.email){
            return res.redirect('/forgot');
        }
        else if(user.forgot!=null){
            return res.redirect('forgot_OTP');
        }
        else{
            return res.render('/forgot_password', { errors });
        }
    }
}));

router.post('/',[ 
    body('password')
        .isLength({min:6,max:50}).withMessage('Ki tu Password 6->50!!!'),
    body('confirm_password')
        .custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Confirm password is wrong!!!');
            }
            return true;
        }),
],asyncHandler(async function (req,res){
    errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render( 'forgot_password', {errors});
    }
    
    const user=await User.findByEmail(req.session.email);

    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    user.password=User.hashPassword(req.body.password);
    user.save();

    delete req.session.email;
    req.session.notification=2;
    return res.redirect('/');
}));

module.exports = router;