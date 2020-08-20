const {Router}=require('express');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Notification=require('../services/notification');
const Email=require('../services/email');
const Account=require('../services/account');
const Accept_user = require('../services/accept_user');
const Bank = require('../services/bank');
const router = new Router();


router.get('/',asyncHandler(async function (req,res){
    const accept_user=await Accept_user.findByPk(req.session.id);
    const user = await User.findById(accept_user.STK);
    await User.deleteById(accept_user.STK);
    await Account.deleteById(user.email);
    await Accept_user.deleteById(req.session.id);
    delete req.session.id;
    return res.redirect('/staff_accept_transactions');
}));

module.exports = router;