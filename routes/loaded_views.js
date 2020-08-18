const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Notification=require('../services/notification');
const Account=require('../services/account');
const Email=require('../services/email');
const Bank=require('../services/bank');
const router = new Router();

var errors=[];

router.get('/', asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
    const account_user= await Account.findById(user.id);
    const bank= await Bank.findByCode(user.bank);
    if(req.session.userId){
        if(user.staff==true){
            return res.redirect('/staff');
        }
        if(user.authentication!=null){
            delete req.session.userId;
            return res.redirect('/login_authentication');
        }
        if(user.lock==true){
            delete req.session.userId;
            return res.redirect('login_locked_account');
        }
        return res.render('loaded_views', { account_user,bank,errors});
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',[
],asyncHandler(async function (req,res){
    const user=await User.findById(req.session.userId);
    const account_user= await Account.findById(user.id);
    const bank= await Bank.findByCode(user.bank);

    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    if(req.body.money<1000000){
        errors = [{ msg: "The amount must be greater than 1.000.000 VND!!!" }];
        return res.render('loaded_views', {errors,bank,account_user});
    }
    if(req.body.money>account_user.money){
        errors = [{ msg: "The account does not have enough money to transact!!!" }];
        return res.render('loaded_views', {errors,bank,account_user});        
    }
    if(req.body.money>=100000000000){
        errors = [{ msg: "The amount must be less than 100.000.000.000 VND!!!" }];
        return res.render('loaded_views', {errors,bank,account_user});        
    }
    errors = [{ msg: "Enter the number of months!!!" }];
    return res.render('loaded_views', {errors,bank,account_user});
}));

module.exports = router;