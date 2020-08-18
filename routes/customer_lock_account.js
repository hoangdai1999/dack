const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Interest_rate = require('../services/interest_rate');
const Account_saving = require('../services/account_saving');
const Accept_user = require('../services/accept_user');
const Bank = require('../services/bank');
const Email=require('../services/email');
const router = new Router();

var time_day=0;
var errors=[];
router.get('/',asyncHandler(async function (req,res){
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
            time_day=await Interest_rate.sum_day(req.session.userId);
        }
        
        return res.render('customer_lock_account',{errors,bank,time_day,account_saving});
    }
    else {
        return res.redirect('/');
    }
    
}));

router.post('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId)
    const bank=await Bank.findByCode(user.bank);
    const account_saving=await Account_saving.findBySTK(req.session.userId);
    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    if(req.body.paper_type!=user.paper_type){
        errors = [{ msg: "The paper type does not match!!!" }];
        return res.render('customer_lock_account',{errors,bank,time_day,account_saving});
    }
    if(user && (req.body.OTP==user.lock_OTP)){        
        user.lock_OTP=null;
        user.save();
        await Accept_user.addUser_account_lock(user.id,user.displayName,user.bank);
        req.session.notification=4;
        return res.redirect('customer');
    }
    errors = [{ msg: "Invalided OTP code !!!" }];
    return res.render('customer_lock_account',{errors,bank,time_day,account_saving});
}));

module.exports = router;