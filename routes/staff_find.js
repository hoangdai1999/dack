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
    var staff=false;
    const user= await User.findById(req.session.userId)
    const x= await User.findById(req.session.STK_find)
    const bank_acc=await Bank.findByCode(user.bank)
    if(req.session.userId){
        if(user.staff==true){
            var count=0;
            const arr_= await Accept_user.findByAll_STK(user.bank)
            if(arr_){
                arr_.forEach(x=>{count=count+1;});
            }
            return res.render('staff_find',{errors,x,i,bank_acc,count});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
})); 

router.post('/',asyncHandler(async function (req,res){
    i=1;
    req.session.STK_find=req.body.STK_find;
    const user= await User.findById(req.session.userId)
    const x= await User.findById(req.body.STK_find)
    const bank_acc=await Bank.findByCode(user.bank)
    var count=0;
    const arr_= await Accept_user.findByAll_STK(user.bank)
    if(arr_){
        arr_.forEach(x=>{count=count+1;});
    }
    errors = [];
    i=1;
    if(x && (x.bank==user.bank) && (x.staff!=true)){
        return res.render('staff_find', { errors, x, i,bank_acc,count});
    }
    req.session.msg="User information could not be found!!!";
    return res.redirect('/staff');
}));

module.exports = router;