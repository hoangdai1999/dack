const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Bank=require('../services/bank');
const Email=require('../services/email');
const Notification=require('../services/notification');
const Accept_user = require('../services/accept_user');
const router = new Router();
 
router.get('/',asyncHandler(async function (req,res){
    const accept_user=await Accept_user.findByPk(req.session.lock_transaction);

    const user=await User.findById(accept_user.STK);
    const bank= await Bank.findByCode(user.bank);
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)

    if(user.transaction_lock==true){
        user.transaction_lock=false;
        user.save();
        Email.send(user.email,'Thông báo!!!',`Quý khách đã mở giao dịch tài khoản thành công!!!\n
                        Ngân hàng ${bank.Name}.`);

        var string=`Quý khách đã mở giao dịch tài khoản thành công!!!\n
                        Ngân hàng ${bank.Name}.`;
        await Notification.addNotification(user.id,string,date_name);
    }
    else{
        user.transaction_lock=true;
        user.save();
        Email.send(user.email,'Thông báo!!!',`Quý khách đã khóa giao dịch tài khoản thành công!!!`);

        var string=`Quý khách đã khóa giao dịch tài khoản thành công!!!`;
        await Notification.addNotification(user.id,string,date_name);
    }
    await Accept_user.deleteById(req.session.lock_transaction);
    delete req.session.lock_transaction;
    return res.redirect('/staff_accept_transactions');
}));

module.exports = router;