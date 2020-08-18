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
    const accept_user=await Accept_user.findByPk(req.session.idSend);
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
        if(user_acc.bank==user_rec.bank){
            //khoản tiền gửi sẽ được cộng vào tk ng nhận
            acc_rec.money=acc_rec.money+transfer.money;
            acc_rec.save();

            //gửi email báo số dư cho ng nhận
            Email.send(user_rec.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa tăng ${transfer.money} VND vào ${date}. \n
                Số dư hiện tại: ${acc_rec.money} VND và ${acc_rec.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Nhận từ số tài khoản ${transfer.STK_acc} của ngân hàng ${bank_acc.Name}. \n
                Tên người gửi ${user_acc.displayName}.\n
                Số tiền: ${transfer.money} VND.`);

            var string=`Số dư tài khoản vừa tăng ${transfer.money} VND vào ${date}. \n
                Số dư hiện tại: ${acc_rec.money} VND và ${acc_rec.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Nhận từ số tài khoản ${transfer.STK_acc} của ngân hàng ${bank_acc.Name}. \n
                Tên người gửi ${user_acc.displayName}.\n
                Số tiền: ${transfer.money} VND.`;
            await Notification.addNotification(user_rec.id,string,date_name);

            await Transfer.deleteById(accept_user.id_send);
            await Accept_user.deleteById(req.session.idSend);
            delete req.session.idSend;
            return res.redirect('/staff_accept_transactions');
        }
        await Accept_user.addUser_receive(transfer.id,transfer.STK,user_rec.displayName,transfer.money,transfer.currency_unit,transfer.STK_acc,user_acc.displayName,bank_acc.code,bank_acc.Name,user_rec.bank);
        await Accept_user.deleteById(req.session.idSend);
        delete req.session.idSend;
        return res.redirect('/staff_accept_transactions');
        
    }
    if(transfer.currency_unit=="USD"){
        if(user_acc.bank==user_rec.bank){
            //khoản tiền gửi sẽ được cộng vào tk ng nhận
            acc_rec.money_USD=acc_rec.money_USD+transfer.money;
            acc_rec.save();

            //gửi email báo số dư cho ng nhận
            Email.send(user_rec.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa tăng ${transfer.money} USD vào ${date}. \n
                Số dư hiện tại: ${acc_rec.money} VND và ${acc_rec.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Nhận từ số tài khoản ${transfer.STK_acc} của ngân hàng ${bank_acc.Name}. \n
                Tên người gửi ${user_acc.displayName}.\n
                Số tiền: ${transfer.money} USD.`);

            var string=`Số dư tài khoản vừa tăng ${transfer.money} VND vào ${date}. \n
                Số dư hiện tại: ${acc_rec.money} VND và ${acc_rec.money_USD} USD. \n
                Mô tả: ${transfer.description}. \n
                Nhận từ số tài khoản ${transfer.STK_acc} của ngân hàng ${bank_acc.Name}. \n
                Tên người gửi ${user_acc.displayName}.\n
                Số tiền: ${transfer.money} USD.`;
            await Notification.addNotification(user_rec.id,string,date_name);

            await Transfer.deleteById(accept_user.id_send);
            await Accept_user.deleteById(req.session.idSend);
            delete req.session.idSend;
            return res.redirect('/staff_accept_transactions');
        }
        await Accept_user.addUser_receive(transfer.id,transfer.STK,user_rec.displayName,transfer.money,transfer.currency_unit,transfer.STK_acc,user_acc.displayName,bank_acc.code,bank_acc.Name,user_rec.bank);
        await Accept_user.deleteById(req.session.idSend);
        delete req.session.idSend;
        return res.redirect('/staff_accept_transactions');
    }        
    return res.redirect('/staff_accept_transactions');
}));

module.exports = router;