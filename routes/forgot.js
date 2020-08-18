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
        return res.render('forgot',{errors});
    }
}));

router.post('/',[
    body('email')
        .isEmail().withMessage('Email not verified!!!')//dữ liệu nhập vào có phải là email hay k
        .normalizeEmail()
        .custom(async function(email){
            const found=await User.findByEmail(email);
            if(!found){
                throw Error('Wrong Email!!!"');
            }
            return true;
        }),
],asyncHandler(async function (req,res){
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('forgot', {errors});
    }
    errors = [];
    const user = await User.findByEmail(req.body.email);

    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    
    user.forgot=crypto.randomBytes(3).toString('hex').toUpperCase(),
    user.save();

    await Email.send(user.email,'Mã OTP: ',`${user.forgot}`);

    req.session.email=req.body.email;
    return res.redirect('/forgot_OTP')
}));

module.exports = router;