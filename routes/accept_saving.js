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
    const account_saving=await Account_saving.findByPk(accept_user.id_send);
    account_saving.check=false;
    account_saving.save();

    const user=await User.findById(account_saving.STK);
    const bank= await Bank.findByCode(user.bank);
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)

    Email.send(user.email,'Thông báo!!!',`Quý khách đã mở và gửi tài khoản tiết kiệm thành công!!!. \n
                Ngân hàng ${bank.Name}.`);

    var string=`Quý khách đã mở và gửi tài khoản tiết kiệm thành công!!!. \n
                Ngân hàng ${bank.Name}.`;
    await Notification.addNotification(user.id,string,date_name);
    
    await Accept_user.deleteById(req.session.idSaving);
    delete req.session.idSaving;
    return res.redirect('/staff_accept_transactions');
}));

module.exports = router;