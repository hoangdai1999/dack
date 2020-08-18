const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const Transfer=require('../services/transfer');
const User=require('../services/user');
const Bank=require('../services/bank');
const Account=require('../services/account');
const Email=require('../services/email');
const Notification=require('../services/notification');
const Accept_user = require('../services/accept_user');
const Interest_rate = require('../services/interest_rate');
const Account_saving = require('../services/account_saving');
const router = new Router();
 
router.get('/',asyncHandler(async function (req,res){
    const accept_user=await Accept_user.findByPk(req.session.idSaving);

    const user=await User.findById(accept_user.STK);
    const bank= await Bank.findByCode(user.bank);
    const acc= await Account.findById(user.id);
    acc.money=acc.money+accept_user.money;
    acc.save();

    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)

    Email.send(user.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa tăng ${accept_user.money} VND vào ${date}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: gửi tài khoản tiết kiệm không thành công!!! \n
                Ngân hàng ${bank.Name}. \n
                Số tiền: ${accept_user.money} VND.`);

    var string=`Số dư tài khoản vừa tăng ${accept_user.money} VND vào ${date}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: gửi tài khoản tiết kiệm không thành công!!! \n
                Ngân hàng ${bank.Name}. \n
                Số tiền: ${accept_user.money} VND.`;
    await Notification.addNotification(user.id,string,date_name);
    
    await Account_saving.deleteById(user.id);
    await Accept_user.deleteById(req.session.idSaving);
    delete req.session.idSaving;
    return res.redirect('/staff_accept_transactions');
})); 

module.exports = router;