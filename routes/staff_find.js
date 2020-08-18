const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User=require('../services/user');
const Bank = require('../services/bank');
const router = new Router();

var errors=[];
var i=1;
router.get('/',asyncHandler(async function (req,res){
    i=1;
    var staff=false;
    const user= await User.findById(req.session.userId)
    const x= await User.findById(req.session.id)
    const bank_acc=await Bank.findByCode(user.bank)
    if(req.session.userId){
        if(user.staff==true){
            return res.render('staff_find',{errors,x,i,bank_acc});
        }
        return res.redirect('/customer');
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',asyncHandler(async function (req,res){
    i=1;
    req.session.id=req.body.STK;
    const user= await User.findById(req.session.userId)
    const x= await User.findById(req.session.id)
    const bank_acc=await Bank.findByCode(user.bank)
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.redirect('/staff');
    }
    errors = [];
    i=1;
    if(!x|| (x.bank!=user.bank) || (x.staff!=false)){
        errors = [{ msg: "User information could not be found!!!" }];
        return res.redirect('/staff');
    }
    
    return res.render('staff_find', { errors, x, i,bank_acc});
}));

module.exports = router;