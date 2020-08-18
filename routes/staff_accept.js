const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Notification=require('../services/notification');
const Email=require('../services/email');
const router = new Router();


router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.id);
    user.authentication_check=false;
    user.save();
    await Email.send(user.email,'Account của bạn đã được xác thực!!!',`Thành công`);
    var temp='Account của bạn đã được xác thực!!!';
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)
    const notification= await Notification.addNotification(user.id,temp,date_name);
    delete req.session.id;
    return res.redirect('/staff');
}));

module.exports = router;