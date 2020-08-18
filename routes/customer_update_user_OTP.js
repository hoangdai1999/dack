const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Interest_rate = require('../services/interest_rate');
const Account_saving = require('../services/account_saving');
const Notification = require('../services/notification');
const Accept_user = require('../services/accept_user');
const Bank = require('../services/bank');
const Email=require('../services/email');

const router = new Router();

var errors=[];
var account_saving;
var time_day=0;
router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId)
    const bank=await Bank.findByCode(user.bank);

    account_saving=await Account_saving.findBySTK(req.session.userId);

    if(req.session.userId){
        if(user.staff==true){
            return res.redirect('/staff');
        }
        if(user.update_OTP==null){
            return res.redirect('customer');
        }
        if(user.authentication!=null){
            req.session.id=req.session.userId;
            delete req.session.userId;
            return res.redirect('/login_authentication');
        }

        if(account_saving){
            time_day=await Interest_rate.sum_day(req.session.userId);
        }
        return res.render('customer_update_user_OTP',{errors,bank,time_day,account_saving});
    }
    else {
        return res.redirect('login');
    }
}));

router.post('/',asyncHandler(async function (req,res){
    errors = validationResult(req);
    const user = await User.findById(req.session.userId);
    const bank=await Bank.findByCode(user.bank);
    account_saving=await Account_saving.findBySTK(req.session.userId);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('customer_update_user_OTP', {errors,bank,time_day,account_saving});
    }
    errors = [];
    

    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId; 
        return res.redirect('login_locked_account');
    }
    if(req.body.OTP!=user.update_OTP){
        errors = [{ msg: "Invalided OTP code !!!" }];
        return res.render('customer_update_user_OTP',{errors,bank,time_day,account_saving});
    }
    if(req.body.paper_type!=user.paper_type){
        errors = [{ msg: "The paper type does not match!!!" }];
        return res.render('customer_update_user_OTP',{errors,bank,time_day,account_saving});
    }
    user.update_OTP=null;
    user.save();
    await Accept_user.addUser_accept_pass(user.id,user.displayName,user.bank);
    req.session.notification=8;
    return res.redirect('/customer');
}));

module.exports = router;