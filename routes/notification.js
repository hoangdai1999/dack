const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Notification=require('../services/notification');
const Account=require('../services/account');
const Email=require('../services/email');
const Bank=require('../services/bank');
const router = new Router();

var errors=[];

router.get('/', asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
    const arr= await Notification.findByIdAll(user.id);
    const bank_acc= await Bank.findByCode(user.bank);

    var i=1;
    if(req.session.userId){
        if(user.staff==true){
            return res.redirect('/staff');
        }
        if(user.authentication!=null){
            delete req.session.userId;
            return res.redirect('/login_authentication');
        }
        if(user.lock==true){
            delete req.session.userId;
            return res.redirect('login_locked_account');
        }
        return res.render('notification', { errors,arr,i,bank_acc});
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',[    
    body('date')
        .trim()//khi load lại nó sẽ làm ms
        .notEmpty().withMessage('Không được để trống Date!!!'),//k dc trống
],asyncHandler(async function (req,res){
    var i=1;
    const user= await User.findById(req.session.userId);
    const bank_acc= await Bank.findByCode(user.bank);
    if(user.authentication!=null){
        delete req.session.userId;
        return res.redirect('/login_authentication');
    } 
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    var arr= await Notification.findByIdAll(user.id)
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('notification', { errors, arr, i,bank_acc});
    }
    errors = [];
    i=1;
    arr= await Notification.findById_DateAll(user.id,req.body.date);
    return res.render('notification', { errors, arr, i,bank_acc});
}));

module.exports = router;