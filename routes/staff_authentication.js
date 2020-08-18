const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Notification=require('../services/notification');
const crypto=require('crypto');
const Email=require('../services/email');
const router = new Router();


router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.id);
    user.authentication=crypto.randomBytes(3).toString('hex').toUpperCase();
    user.save();
    await Email.send(user.email,'Yêu cầu xác thực lại Account',`Mã OTP: ${user.authentication}`);
    var temp='Yêu cầu xác thực lại Account';
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)
    const notification= await Notification.addNotification(user.id,temp,date_name);
    delete req.session.id;
    return res.redirect('/staff');
}));

module.exports = router;