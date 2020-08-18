const Account=require('../services/account');
const asyncHandler=require('express-async-handler');

module.exports= asyncHandler(async function auth(req,res,next){
    const userId=req.session.userId;
    res.locals.currentAccount=null;
    if(!userId){
        return next();
    }
    const accout= await Account.findById(userId);
    if(!accout){
        return next();
    }

    req.currentAccount=accout;
    res.locals.currentAccount=accout;
    next();
});