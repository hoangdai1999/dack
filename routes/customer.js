const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Interest_rate = require('../services/interest_rate');
const Account_saving = require('../services/account_saving');
const Notification = require('../services/notification');
const Bank = require('../services/bank');
const Email=require('../services/email');
const crypto=require('crypto');
const router = new Router();

var time_day=0;
router.get('/',asyncHandler(async function (req,res){
    var notification=0;
    if(req.session.notification){
        notification=req.session.notification;
        delete req.session.notification;
    }
    const user= await User.findById(req.session.userId)
    const bank=await Bank.findByCode(user.bank);
    const account_saving=await Account_saving.findBySTK(req.session.userId);
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
        if(account_saving){
            time_day=await Interest_rate.sum_day(account_saving);
        }
        
        return res.render('customer',{bank,time_day,account_saving,notification});
    }
    else {
        return res.redirect('/');
    }
    
}));

router.post('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId)
    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    if(req.body.lock=="Lock account"){        
        user.lock_OTP=crypto.randomBytes(3).toString('hex').toUpperCase();
        user.save();

        Email.send(user.email,'Mã OTP',`${user.lock_OTP}`);
        return res.redirect('customer_lock_account');
    }
    else{
        user.transaction_lock_OTP=crypto.randomBytes(3).toString('hex').toUpperCase();
        user.save();

        Email.send(user.email,'Mã OTP',`${user.transaction_lock_OTP}`);
        return res.redirect('customer_lock_transaction');
    }
}));

module.exports = router;