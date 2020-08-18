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
    const accept_user=await Accept_user.findByPk(req.session.idReceive);
    const transfer = await Transfer.findById(accept_user.id_send);
    //truy vấn thông tn ng gửi
    const acc= await Account.findById(transfer.STK_acc);
    const user_acc= await User.findById(transfer.STK_acc);
    const bank_acc= await Bank.findByCode(user_acc.bank);

    //truy vấn thông tn ng nhận
    const acc_rec= await Account.findById(transfer.STK);
    const user_rec= await User.findById(transfer.STK);
    const bank_rec= await Bank.findByCode(user_rec.bank);

    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)

    if(transfer.currency_unit=="VND"){
        acc.money=acc.money+transfer.money+transfer.tax;
        acc.save();
        var temp =transfer.money+transfer.tax;

        Email.send(user_acc.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa tăng ${temp} VND vào ${date}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: giao dịch không thành công. \n
                Gửi cho số tài khoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người gửi ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} VND.`);

        var string=`Số dư tài khoản vừa tăng ${temp} VND vào ${date}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: giao dịch không thành công. \n
                Gửi cho số tài khoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người gửi ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} VND.`;

        await Notification.addNotification(user_acc.id,string,date_name);

        await Transfer.deleteById(accept_user.id_send);
        await Accept_user.deleteById(req.session.idReceive);
        delete req.session.idReceive;
        return res.redirect('/staff_accept_transactions');
        
    }
    if(transfer.currency_unit=="USD"){
        acc.money_USD=acc.money_USD+transfer.money;
        acc.save();

        Email.send(user_acc.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa tăng ${transfer.money} USD vào ${date}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: giao dịch không thành công. \n
                Gửi cho số tài khoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người gửi ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} USD.`);

        var string=`Số dư tài khoản vừa tăng ${transfer.money} USD vào ${date}. \n
                Số dư hiện tại: ${acc.money} VND và ${acc.money_USD} USD. \n
                Mô tả: giao dịch không thành công. \n
                Gửi cho số tài khoản ${transfer.STK} của ngân hàng ${bank_rec.Name}. \n
                Tên người gửi ${user_rec.displayName}.\n
                Số tiền: ${transfer.money} USD.`;
        await Notification.addNotification(user_acc.id,string,date_name);

        await Transfer.deleteById(accept_user.id_send);
        await Accept_user.deleteById(req.session.idReceive);
        delete req.session.idReceive;
        return res.redirect('/staff_accept_transactions');
    }        
    return res.redirect('/staff_accept_transactions');
}));

module.exports = router;