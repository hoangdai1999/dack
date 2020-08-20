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
    errors=[];
    var staff=false;
    delete req.session.id;
    var notification=0;
    if(req.session.notification){
        notification=req.session.notification;
        delete req.session.notification;
        delete req.session.STK_find;
    }
    const user= await User.findById(req.session.userId)
    const arr= await User.findByAll_STK_Bank(user.bank,staff)
    const bank_acc=await Bank.findByCode(user.bank)
    if(req.session.userId){
        if(user.staff==true){
            var count=0;
            const arr_= await Accept_user.findByAll_STK(user.bank)
            if(arr_){
                arr_.forEach(x=>{count=count+1;});
            }
            if(req.session.msg){
                errors = [{ msg: "User information could not be found!!!" }];
                delete req.session.msg;
            }
            return res.render('staff',{errors,arr,i,bank_acc,notification,count});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
}));

module.exports = router;