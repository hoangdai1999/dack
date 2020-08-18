const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Account_saving=require('../services/account_saving');
const Interest_rate=require('../services/interest_rate');
const Notification=require('../services/notification');
const Account=require('../services/account');
const Email=require('../services/email');
const Bank=require('../services/bank');
const router = new Router();

var errors=[];

var time_day;

router.get('/', asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
    const account_saving=await Account_saving.findBySTK(req.session.userId);
    const account_user= await Account.findById(user.id);
    const bank= await Bank.findByCode(user.bank);
    const today= await Interest_rate.sent_date();
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
        if(account_saving){
            time_day=await Interest_rate.sum_day(req.session.userId);
            return res.render('loaded_bill', { account_user,bank,errors,account_saving,time_day});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',[
],asyncHandler(async function (req,res){

    const account_saving=await Account_saving.findBySTK(req.session.userId);
    const user=await User.findById(req.session.userId);
    const account_user= await Account.findById(user.id);
    const bank= await Bank.findByCode(user.bank);

    errors=[];
    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    if(!User.verifyPassword(req.body.password,user.password)){
        errors = [{ msg: "Wrong password!!!" }];
        return res.render('loaded_bill', { account_user,bank,errors,account_saving,time_day});
    }

    var today = new Date();
    var date= today.toISOString();
    const sent_date= await Interest_rate.sent_date();

    account_user.money=account_user.money+account_saving.money;
    account_user.save();

    await Email.send(user.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa tăng ${account_saving.money} VND vào ngày ${date}. \n
                Số dư hiện tại: ${account_user.money} VND. \n
                Mô tả: hủy giao dịch tiết kiệm ${bank.Name}. \n
                Số tiền: ${account_saving.money} VND.`);

    var string=`Số dư tài khoản vừa tăng ${account_saving.money} VND vào ngày ${date}. \n
                Số dư hiện tại: ${account_user.money} VND. \n
                Mô tả: hủy giao dịch tiết kiệm ${bank.Name}. \n
                Số tiền: ${account_saving.money} VND.`;
            
    await Notification.addNotification(user.id,string,sent_date);
    await Account_saving.deleteById(user.id);
    req.session.notification=6;
    return res.redirect('/customer');
}));

module.exports = router;