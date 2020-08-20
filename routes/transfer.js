const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Bank=require('../services/bank');
const Transfer=require('../services/transfer');
const Account=require('../services/account');
const Interest_rate = require('../services/interest_rate');
const Notification = require('../services/notification');
const Account_saving = require('../services/account_saving');
const Email=require('../services/email');
const router = new Router();

var errors=[];
var time_day=0;
var string="";
router.get('/', asyncHandler(async function (req,res){
    
    const user= await User.findById(req.session.userId)
    const bank= await Bank.findByAll();
    const bank_user=await Bank.findByCode(user.bank);
    const account_saving=await Account_saving.findBySTK(req.session.userId);

    if(req.session.userId){
        if(user.staff==true){
            return res.redirect('/staff');
        }
        if(user.authentication!=null){
            req.session.id=req.session.userId;
            delete req.session.userId;
            return res.redirect('/login_authentication');
        }
        if(user.lock==true){
            delete req.session.userId;
            return res.redirect('login_locked_account');
        }
        if(account_saving){
            time_day=await Interest_rate.sum_day(account_saving);
        }
        return res.render('transfer', { errors, bank,bank_user,time_day,account_saving,string});
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',asyncHandler(async function (req,res){
    const bank= await Bank.findByAll();
    const user_acc= await User.findById(req.session.userId);
    const user_rec= await User.findById(req.body.STK);
    const bank_user=await Bank.findByCode(user_acc.bank);
    const account_saving=await Account_saving.findBySTK(req.session.userId);
    if(user_acc.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user_acc.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('transfer', { errors, bank,time_day,account_saving,string});
    }
    errors = [];
    var today = new Date();
    var date= today.toISOString();
    var date_name=date.substring(0,10)

    //check xem có user của STK đó k nếu có thì có cùng displayname and mã bank k
    if(!user_rec|| (user_rec.displayName!=(req.body.displayname).toUpperCase()) || (user_rec.bank!=req.body.code) || (user_rec.staff!=false)){
        errors = [{ msg: "User information could not be found!!!" }];
        return res.render('transfer', { errors, bank,time_day,account_saving,string});
    }

    if(req.body.currency=="VND"){
        //đk 1 lần giao dịch dưới 50tr
        if(req.body.money>50000000){
            errors = [{ msg: "Maximum of 1 transfer is 50,000,000 VND!!!" }];
            return res.render('transfer', { errors, bank,time_day,account_saving,string});
        }
    
        //check xem acc còn đủ tiền để giao dịch k
        const acc = await Account.findById(user_acc.id);
        var temp=0;
        if(user_acc.bank==user_rec.bank){
            temp=bank_user.same_bank;
        }
        else{
            temp=bank_user.other_banks;
        }
        const x=Number(req.body.money);
        if((acc.money-(x+temp))<0){
            errors = [{ msg: "You do not have enough money to make this transaction!!!" }];
            return res.render('transfer', { errors, bank,time_day,account_saving,string});
        }

        //dkien 1 ngày giao dịch < 200tr
        const addSend=await Transfer.addTransfer_sender(req.session.userId,req.body.STK,req.body.money,req.body.description,req.body.currency,date_name);
        const check_money_date= await Transfer.findAllSTK_sender(req.session.userId,addSend.date,req.body.currency);
        if(check_money_date>200000000){
            await Transfer.deleteById(addSend.id)
            errors = [{ msg: "Maximum of 1 day of transfer is 200,000,000 VND!!!" }];
            return res.render('transfer', { errors, bank,time_day,account_saving,string});
        }

        //save tax phí lại
        addSend.tax=temp;
        addSend.save();
        

        //gửi OTP qua email
        Email.send(user_acc.email,'Mã OTP',`${addSend.OTP}.`);

        req.session.idTransfer=addSend.id;
        return res.redirect('/transfer_OTP');
    }
    else{
        //đk 1 lần giao dịch dưới 50tr
        if(req.body.money>5000){
            errors = [{ msg: "Maximum of 1 transfer is 5,000 USD!!!" }];
            return res.render('transfer', { errors, bank,time_day,account_saving,string});
        }
    
        //check xem acc còn đủ tiền để giao dịch k
        const acc = await Account.findById(user_acc.id);
        const x=Number(req.body.money);
        if((acc.money_USD-x)<0){
            errors = [{ msg: "You do not have enough money to make this transaction!!!" }];
            return res.render('transfer', { errors, bank,time_day,account_saving,string});
        }

        //dkien 1 ngày giao dịch < 200tr
        const addSend=await Transfer.addTransfer_sender(req.session.userId,req.body.STK,req.body.money,req.body.description,req.body.currency,date_name);
        const check_money_date= await Transfer.findAllSTK_sender(req.session.userId,addSend.date,req.body.currency);
        if(check_money_date>50000){
            await Transfer.deleteById(addSend.id)
            errors = [{ msg: "Maximum of 1 day of transfer is 20,000 USD!!!" }];
            return res.render('transfer', { errors, bank,time_day,account_saving,string});
        }

        //gửi OTP qua email
        Email.send(user_acc.email,'Mã OTP',`${addSend.OTP}.`);

        req.session.idTransfer=addSend.id;
        return res.redirect('/transfer_OTP');
    }
}));

module.exports = router;