const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Notification=require('../services/notification');
const Email=require('../services/email');
const Bank = require('../services/bank');
const router = new Router();


router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.id);
    const bank=await Bank.findByCode(user.bank)
    user.lock=true;
    user.save();
    await Email.send(user.email,'Account của bạn đã khóa!!!',`Bạn cần ra ngân hàng ${bank.Name} để xác thực mở account!!!`);
    var temp='Account của bạn đã bị khóa!!!';
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)
    const notification= await Notification.addNotification(user.id,temp,date_name);
    delete req.session.id;
    return res.redirect('/staff');
}));

module.exports = router;