const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const User=require('../services/user');
const Interest_rate=require('../services/interest_rate');
const Notification=require('../services/notification');
const Account_saving=require('../services/account_saving');
const Accept_user = require('../services/accept_user');
const Account=require('../services/account');
const Email=require('../services/email');
const Bank=require('../services/bank');
const router = new Router();

var errors=[];
var money=0;//tiền gửi
var month=1;//số tháng gửi
var money_rate=0;//tiền lãi
var sent_date;//ngày gửi
var appointment_date;//ngày hẹn
var total_money=0;//tổng tiền gốc và lãi
router.get('/', asyncHandler(async function (req,res){

    const interest_rate = await Interest_rate.findByMonth(month);
    const user= await User.findById(req.session.userId);
    const account_user= await Account.findById(user.id);
    const bank= await Bank.findByCode(user.bank);

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
        if(!appointment_date){
            return res.redirect('loaded_views');
        }
        return res.render('loaded', { account_user,bank,errors,money,interest_rate,money_rate,sent_date,appointment_date,total_money,month});
    }
    else {
        return res.redirect('/');
    }
}));

router.post('/',asyncHandler(async function (req,res){
    if(req.body.month){
        month=req.body.month;
    }
    if(req.body.month){
        money=req.body.money;
    }

    errors=[];

    if(!req.session.userId){
        return res.redirect('/');
    }
    

    const interest_rate = await Interest_rate.findByMonth(month);
    const user= await User.findById(req.session.userId);
    const account_user= await Account.findById(user.id);
    const bank= await Bank.findByCode(user.bank);


    //ngày hiện tại
    sent_date=await Interest_rate.sent_date();
    //tới hạn
    var today_th1 = new Date(sent_date);
    var date_th1= today_th1.toISOString();
    var year_th1=Number(date_th1.substring(0,4));
    var month_th1=Number(date_th1.substring(5,7))+Number(month)-1;
    var day_th1=Number(date_th1.substring(8,10));
    var today_th2=new Date(year_th1,month_th1,day_th1,12,00,00);
    var date_th2= today_th2.toISOString();
    appointment_date=date_th2.substring(0,10);

    //tiền lãi
    if(month==1){
        money_rate=money*interest_rate.rate*0.01/12;
    }
    else if(month==3){
        money_rate=money*interest_rate.rate*0.01/4;
    }
    else if(month==6){
        money_rate=money*interest_rate.rate*0.01/2;
    }
    else if(month==12){
        money_rate=money*interest_rate.rate*0.01;
    }
    else {
        money_rate=money*interest_rate.rate*0.01*1.5;
    }
    money_rate = money_rate.toFixed(0);

    //tổng tiền
    total_money=Number(money)+Number(money_rate);


    if(user.authentication!=null){
        req.session.id=req.session.userId;
        delete req.session.userId;
        return res.redirect('/login_authentication');
    }
    if(user.lock==true){
        delete req.session.userId;
        return res.redirect('login_locked_account');
    }
    if(money<1000000){
        errors = [{ msg: "The amount must be greater than 1.000.000 VND!!!" }];
        return res.render('loaded', {account_user,bank,errors,money,interest_rate,money_rate,sent_date,appointment_date,total_money,month});
    }
    if(money>account_user.money){
        errors = [{ msg: "The account does not have enough money to transact!!!" }];
        return res.render('loaded', {account_user,bank,errors,money,interest_rate,money_rate,sent_date,appointment_date,total_money,month});        
    }
    if(money>=100000000000){
        errors = [{ msg: "The amount must be less than 100.000.000.000 VND!!!" }];
        return res.render('loaded', {account_user,bank,errors,money,interest_rate,money_rate,sent_date,appointment_date,total_money,month});        
    }
    if(!req.body.password){
        errors=[];
        return res.render('loaded', {account_user,bank,errors,money,interest_rate,money_rate,sent_date,appointment_date,total_money,month});
    }
    if(!User.verifyPassword(req.body.password,user.password)){
        errors = [{ msg: "Wrong password!!!" }];
        return res.render('loaded', {account_user,bank,errors,money,interest_rate,money_rate,sent_date,appointment_date,total_money,month});
    }
    const account_saving=await Account_saving.addAccount_saving(user.id,month,sent_date,appointment_date,interest_rate.rate,money_rate,money,total_money)
    account_user.money=account_user.money-money;
    account_user.save();

    await Accept_user.addUser_saving(account_saving.id,account_saving.STK,user.displayName,account_saving.money,account_saving.total_money,account_saving.month,account_saving.date_received,user.bank);
 
    Email.send(user.email,'Thay đổi số dư tài khoản',`Số dư tài khoản vừa giảm ${money} VND vào ngày ${account_saving.createdAt}. \n
            Số dư hiện tại: ${account_user.money} VND. \n
            Mô tả: gửi tài khoản tiết kiệm ngân hàng ${bank.Name}. \n
            Số tiền: ${money} VND. \n
            Ngày mở Tài khoản tiết kiệm: ${sent_date}. \n
            Ngày đến hẹn:${appointment_date}. `);

    var string=`Số dư tài khoản vừa giảm ${money} VND vào ngày ${account_saving.createdAt}. \n
            Số dư hiện tại: ${account_user.money} VND. \n
            Mô tả: gửi tài khoản tiết kiệm ngân hàng ${bank.Name}. \n
            Số tiền: ${money} VND. \n
            Ngày mở Tài khoản tiết kiệm: ${sent_date}. \n
            Ngày đến hẹn:${appointment_date}. `;
        
    await Notification.addNotification(user.id,string,sent_date);
    req.session.notification=5;
    return res.redirect('/customer');
}));

module.exports = router;