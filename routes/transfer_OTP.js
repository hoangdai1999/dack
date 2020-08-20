const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const Transfer=require('../services/transfer');
const User=require('../services/user');
const Bank=require('../services/bank');
const Account=require('../services/account');
const Email=require('../services/email');
const Notification=require('../services/notification');
const Interest_rate = require('../services/interest_rate');
const Accept_user = require('../services/accept_user');
const Account_saving = require('../services/account_saving');
const router = new Router();

var errors=[];
var time_day=0;
router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
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
        if(req.session.idTransfer){
            return res.render('transfer_OTP',{errors,bank,time_day,account_saving});
        }
        return res.redirect('/transfer');
    }
    else {
        return res.redirect('/login');
    }
}));

router.post('/',asyncHandler(async function (req,res){
    errors = validationResult(req);
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
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('transfer_OTP', {errors,bank,time_day,account_saving});
    }
    errors = [];
    if(req.body.paper_type!=user.paper_type){
        errors = [{ msg: "The paper type does not match!!!" }];
        return res.render('transfer_OTP', {errors,bank,time_day,account_saving});
    }

    const transfer = await Transfer.findById(req.session.idTransfer);
    if(transfer && (req.body.OTP===transfer.OTP)){
        transfer.OTP=null;//xét = null thì ms xuất qua staff
        transfer.save();
 
        //truy vấn thông tn ng gửi
        const acc= await Account.findById(transfer.STK_acc);
        const user_acc= await User.findById(transfer.STK_acc);
        const bank_acc= await Bank.findByCode(user_acc.bank);

        //truy vấn thông tn ng nhận
        const acc_rec= await Account.findById(transfer.STK);
        const user_rec= await User.findById(transfer.STK);
        const bank_rec= await Bank.findByCode(user_rec.bank);

        if(transfer.currency_unit=="VND"){
            
            //khoản tiền gửi sẽ bị trừ vào tk ng gửi
            acc.money=acc.money-transfer.money-transfer.tax;
            acc.save();

            //gửi email báo số dư cho ng gửi
            Email.send(user_acc.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa giảm ${transfer.money} VND vào ${transfer.createdAt}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Gửi cho số tài hoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người nhận ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} VND phí ${transfer.tax} VND.`);

            var string=`Số dư tài khoản vừa giảm ${transfer.money} VND vào ${transfer.createdAt}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Gửi cho số tài hoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người nhận ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} VND phí ${transfer.tax} VND.`;

            var today = new Date();
            var date= today.toISOString();
            var date_name=date.substring(0,10)
            const notification=await Notification.addNotification(user_acc.id,string,date_name);
            
            await Accept_user.addUser_send(transfer.id,transfer.STK_acc,user_acc.displayName,transfer.money,transfer.currency_unit,transfer.STK,user_rec.displayName,bank_rec.code,bank_rec.Name,user_acc.bank);

            delete req.session.idTransfer;
            req.session.notification=7;
            return res.redirect('/customer');
        }
        if(transfer.currency_unit=="USD"){
            //khoản tiền gửi sẽ bị trừ vào tk ng gửi
            acc.money_USD=acc.money_USD-transfer.money;
            acc.save();

            //gửi email báo số dư cho ng gửi
            Email.send(user_acc.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa giảm ${transfer.money} USD vào ${transfer.createdAt}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Gửi cho số tài hoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người nhận ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} USD.`);

            var string=`Số dư tài khoản vừa giảm ${transfer.money} USD vào ${transfer.createdAt}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Gửi cho số tài hoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người nhận ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} USD.`;

            var today = new Date();
            var date= today.toISOString();
            var date_name=date.substring(0,10)
            const notification=await Notification.addNotification(user_acc.id,string,date_name);

            await Accept_user.addUser_send(transfer.id,transfer.STK_acc,user_acc.displayName,transfer.money,transfer.currency_unit,transfer.STK,user_rec.displayName,bank_rec.code,bank_rec.Name,user_acc.bank);

            delete req.session.idTransfer;
            req.session.notification=7;
            return res.redirect('/customer');
        }        
    }

    errors = [{ msg: "Wrong OTP!!!" }];
    return res.render('transfer_OTP',{errors,bank,time_day,account_saving});
}));

module.exports = router;