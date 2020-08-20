const {Router}=require('express');
const User=require('../services/user');
const Bank = require('../services/bank');
const Notification=require('../services/notification');
const asyncHandler=require('express-async-handler');
const Email=require('../services/email');

const router = new Router();

router.get('/:id/:OTP',asyncHandler(async function (req,res){
    const{id,OTP}=req.params;
    if(id>=1000000){
        return res.redirect('/loaded_views');
    }
    if(id=='update'){
        req.session.id=OTP;
        return res.redirect('/update');
    }
    if(id=='authentication'){
        req.session.id=OTP;
        return res.redirect('/authentication');
    }
    if(id=='works_again'){
        req.session.id=OTP;
        return res.redirect('/works_again');
    }
    if(id=='locked'){
        req.session.id=OTP;
        return res.redirect('/locked');
    }
    if(id=='accept'){
        req.session.id=OTP;
        return res.redirect('/accept');
    }
    if(id=='refuse'){
        req.session.id=OTP;
        return res.redirect('/refuse');
    }
    if(id=='information'){
        req.session.id=OTP;
        return res.redirect('/information');
    }
    if(id=='accept_send'){
        req.session.idSend=OTP;
        return res.redirect('/accept_send');
    }
    if(id=='refuse_send'){
        req.session.idSend=OTP;
        return res.redirect('/refuse_send');
    }
    if(id=='accept_receive'){
        req.session.idReceive=OTP;
        return res.redirect('/accept_receive');
    }
    if(id=='refuse_receive'){
        req.session.idReceive=OTP;
        return res.redirect('/refuse_receive');
    }
    if(id=='accept_saving'){
        req.session.idSaving=OTP;
        return res.redirect('/accept_saving');
    }
    if(id=='refuse_saving'){
        req.session.idSaving=OTP;
        return res.redirect('/refuse_saving');
    }
    if(id=='accept_password'){
        req.session.password=OTP;
        return res.redirect('/accept_password');
    }
    if(id=='refuse_password'){
        req.session.password=OTP;
        return res.redirect('/refuse_password');
    }
    if(id=='accept_lock_transaction'){
        req.session.lock_transaction=OTP;
        return res.redirect('/accept_lock_transaction');
    }
    if(id=='refuse_lock_transaction'){
        req.session.lock_transaction=OTP;
        return res.redirect('/refuse_lock_transaction');
    }
    if(id=='accept_lock_account'){
        req.session.lock_account=OTP;
        return res.redirect('/accept_lock_account');
    }
    if(id=='refuse_lock_account'){
        req.session.lock_account=OTP;
        return res.redirect('/refuse_lock_account');
    }
    if(id=='accept_user'){
        req.session.id=OTP;
        return res.redirect('/accept_user');
    }
    if(id=='refuse_user'){
        req.session.id=OTP;
        return res.redirect('/refuse_user');
    }
    const user=await User.findById(id);
    if(user && user.OTP === OTP){
        user.OTP=null;
        user.save();
        const bank=await Bank.findByCode(user.bank)
        await Email.send(user.email,'Thông báo!!!',`Chúc mừng quý khách đã kích hoạt tài khoản thành công!!!\n
                    Chào mừng quý khác đã đến với ngân hàng ${bank.Name}.`);

        var temp=`Chúc mừng quý khách đã kích hoạt tài khoản thành công!!!\n
            Chào mừng quý khác đã đến với ngân hàng ${bank.Name}.`;

        var today = new Date();
        var date= today.toISOString();
        var date_name=date.substring(0,10)
        await Notification.addNotification(user.id,temp,date_name);
        req.session.userId=user.id;
        return res.redirect('/customer');
    }
    else{
        return res.redirect('/login_locked_account');
    }    
}));

module.exports = router;