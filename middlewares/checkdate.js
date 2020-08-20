const User =require('../services/user');
const Account_saving = require('../services/account_saving');
const Notification = require('../services/notification');
const Interest_rate=require('../services/interest_rate');
const Bank = require('../services/bank');
const Account=require('../services/account');
const Email=require('../services/email');
const asyncHandler=require('express-async-handler');

module.exports= asyncHandler(async function auth(req,res,next){
    const userId=req.session.userId;
    if(!userId){
        return next();
    }
    const user= await User.findById(userId);
    if(!user){
        return next();
    }
    const account_saving=await Account_saving.findBySTK(user.id);
    if(!account_saving){
        return next();
    }
    const bank=await Bank.findByCode(user.bank);
    const account_user= await Account.findById(user.id);
    var today = new Date();
    var date= today.toISOString();
    var sent_date=date.substring(0,10);
    var time_day=await Interest_rate.sum_day(account_saving);
    if((account_saving.date_received==sent_date && account_saving.check==false)||(time_day<0 && account_saving.check==false)){
                            
        await Notification.addNotification(user.id,string,sent_date);
        account_saving.check=true;
        account_saving.save();
        await Account_saving.deleteById(user.id);
        
        account_user.money_save=account_user.money_save+account_saving.total_money;
        account_user.save();

        var today = new Date(sent_date);
        var date= today.toISOString();
        //ngày hiện tại
        var date_=await Interest_rate.sent_date();

        Email.send(user.email,'Thay đổi số dư tài khoản tiết kiệm',`Số dư tài khoản tiết kiệm vừa tăng ${account_saving.total_money} VND vào ${date}. \n
            Số dư tài khoản tiết kiệm hiện tại: ${account_user.money_save} VND. \n
            Mô tả: Đến kì hẹn gửi tiền tiết kiệm.\n
            Ngân hàng: ${bank.Name}.`);

        var string=`Số dư tài khoản tiết kiệm vừa tăng ${account_saving.total_money} VND vào ${date}. \n
            Số dư tài khoản tiết kiệm hiện tại: ${account_user.money_save} VND. \n
            Mô tả: Đến kì hẹn gửi tiền tiết kiệm.\n
            Ngân hàng: ${bank.Name}.\n
            Số tiền: ${account_saving.total_money} VND.`
        
        await Notification.addNotification(user.id,string,date_);
    }
    next();
});