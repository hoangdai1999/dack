const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User=require('../services/user');
const Bank = require('../services/bank');
const Notification=require('../services/notification');
const Email=require('../services/email');
const router = new Router();

var errors=[];
router.get('/',asyncHandler(async function (req,res){
    const user= await User.findById(req.session.id);
    const bank=await Bank.findByCode(user.bank)
    const user_staff= await User.findById(req.session.userId);
    if(req.session.userId){
        if(user_staff.staff==true){
            return res.render('staff_update',{errors,bank,user});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',[    
    body('displayname')
        .trim(),//khi load lại nó sẽ làm ms
    body('email')
        .trim(),
    body('sdt')
        .trim(),//khi load lại nó sẽ làm ms
    body('paper_type')
        .trim(),//khi load lại nó sẽ làm ms
    body('paper_number')
        .trim(),//khi load lại nó sẽ làm ms,
    body('birthday')
        .trim(),//khi load lại nó sẽ làm ms
],asyncHandler(async function (req,res){
    var user= await User.findById(req.session.id);
    const bank=await Bank.findByCode(user.bank)
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('staff_update', {errors,bank,user});
    }
    errors=[];
    user= await User.findById(req.session.id);
    if(req.body.email!==''){
        const found=await User.findByEmail(req.body.email);
        if(found){
            errors = [{ msg: "Email already exists!!!" }];
            return res.render('staff_update', { errors,bank ,user});
        }
        user.email=req.body.email;
        user.save();
    }
    if(req.body.password!==''){
        user.password=await User.hashPassword(req.body.password);
        user.save();
    }
    if(req.body.displayname!==''){
        user.displayName=(req.body.displayname).toUpperCase();
        user.save();
    }
    if(req.body.sdt!==''){
        user.SDT=req.body.sdt;
        user.save();
    }
    if(req.body.paper_type!==''){
        user.paper_type=req.body.paper_type;
        user.save();
    }
    if(req.body.paper_number!==''){
        user.paper_number=req.body.paper_number;
        user.save();
    }
    if(req.body.birthday!==''){
        user.birthday=req.body.birthday;
        user.save();
    }
    await Email.send(user.email,'Thay đổi Thông tin Account',`Thành công`);
    var temp='Đã Thay đổi Thông tin Account';
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)
    const notification= await Notification.addNotification(user.id,temp,date_name);
    return res.redirect('/update');
}));

module.exports = router;