const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User=require('../services/user');
const Bank = require('../services/bank');
const Accept_user = require('../services/accept_user');
const router = new Router(); 

var errors=[];
var i=1;
router.get('/',asyncHandler(async function (req,res){
    i=1;
    const user= await User.findById(req.session.userId)
    const arr= await Accept_user.findByAll_STK(user.bank)
    const bank_acc=await Bank.findByCode(user.bank)
    if(req.session.userId){
        if(user.staff==true){
            var count=0;
            const arr_= await Accept_user.findByAll_STK(user.bank)
            if(arr_){
                arr_.forEach(x=>{count=count+1;});
            }
            return res.render('staff_accept_transactions',{errors,arr,i,bank_acc,count});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
})); 

router.post('/',asyncHandler(async function (req,res){
    i=1;
    const user= await User.findById(req.session.userId)
    var arr= await Accept_user.findByAll_STK(user.bank)
    const bank_acc=await Bank.findByCode(user.bank)
    var count=0;
    const arr_= await Accept_user.findByAll_STK(user.bank)
    if(arr_){
        arr_.forEach(x=>{count=count+1;});
    }
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('staff_accept_transactions', { errors, arr, i,bank_acc,count});
    }
    errors = [];
    i=1;
    const user_rec=await User.findById(req.body.STK);
    if(!user_rec|| (user_rec.bank!=user.bank) || (user_rec.staff!=false)){
        errors = [{ msg: "User information could not be found!!!" }];
        return res.render('staff_accept_transactions', { errors, arr, i,bank_acc,count});
    }
    arr= await Accept_user.findByAll_STK_bank(user_rec.id,user.bank)
    
    return res.render('staff_accept_transactions', { errors, arr, i,bank_acc,count});
}));

module.exports = router;