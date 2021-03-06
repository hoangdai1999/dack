const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User=require('../services/user');
const Bank = require('../services/bank');
const Notification=require('../services/notification');
const Accept_user = require('../services/accept_user');
const Email=require('../services/email');
const router = new Router();
 
var errors=[];
router.get('/',asyncHandler(async function (req,res){
    var i=1;
    const user= await User.findById(req.session.id);
    const bank=await Bank.findByCode(user.bank);
    const arr= await Notification.findByIdAll(user.id);
    const user_staff= await User.findById(req.session.userId);
    if(req.session.userId){
        if(user_staff.staff==true){
            var count=0;
            const arr_= await Accept_user.findByAll_STK(user.bank)
            if(arr_){
                arr_.forEach(x=>{count=count+1;});
            }
            return res.render('staff_information',{errors,bank,arr,i,count});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',[     
    body('date')
        .notEmpty().withMessage('Không được để trống Date head!!!'),//k dc trống
],asyncHandler(async function (req,res){
    const user= await User.findById(req.session.id);
    const bank=await Bank.findByCode(user.bank)
    var arr= await Notification.findByIdAll(user.id);
    var i=1; 
    var count=0;
    const arr_= await Accept_user.findByAll_STK(user.bank)
    if(arr_){
        arr_.forEach(x=>{count=count+1;});
    }
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('staff_information', {errors,bank,arr,i,count});
    }
    errors = [];
    i=1;

    arr= await Notification.findById_DateAll(user.id,req.body.date);
    return res.render('staff_information', { errors, arr, i,bank,count});
}));

module.exports = router;