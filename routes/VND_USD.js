const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Bank=require('../services/bank');
const Transfer=require('../services/transfer');
const Account=require('../services/account');
const Interest_rate = require('../services/interest_rate');
const Notification = require('../services/notification');
const Account_saving = require('../services/account_saving');
const Email=require('../services/email');
const router = new Router();

var errors=[];
var time_day=0;

router.get('/', asyncHandler(async function (req,res){
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
        return res.render('VND_USD', { errors, bank,time_day,account_saving});
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
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
    errors = [];
 
    //check xem acc còn đủ tiền để giao dịch k
    const acc = await Account.findById(user.id);
    const x=Number(req.body.money);
    if(x<50000){
        errors = [{ msg: "Minimum transfer of 50,000 VND!!!" }];
        return res.render('VND_USD', { errors, bank,time_day,account_saving});
    }
    if((acc.money-x)<0){
        errors = [{ msg: "You do not have enough money to make this transaction!!!" }];
        return res.render('VND_USD', { errors, bank,time_day,account_saving});
    }

    req.session.money_VND=x;
    return res.redirect('/VND_USD_pass');
}));

module.exports = router;