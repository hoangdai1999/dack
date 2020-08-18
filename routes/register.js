const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const crypto=require('crypto');
const User=require('../services/user');
const Account=require('../services/account');
const Bank=require('../services/bank');
const Accept_user = require('../services/accept_user');
const Email=require('../services/email');

const path = require('path');
// var multer = require('multer')
// var upload = multer({ dest: path.join(__dirname, '..', 'uploads') })

const router = new Router();

var errors=[];
router.get('/', asyncHandler(async function (req,res){
    const user= await User.findById(req.session.userId);
    const bank= await Bank.findByAll();
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
        return res.redirect('/customer');
    }
    else {
        return res.render('register',{errors,bank});
    }
}));

router.post('/',[
    body('email')
        .isEmail().withMessage('Email not verified!!!')//dữ liệu nhập vào có phải là email hay k
        .normalizeEmail()
        .custom(async function(email){
            const found=await User.findByEmail(email);
            if(found){
                throw Error('Email already exists!!!');
            }
            return true;
        }),
    body('password')
        .isLength({min:6,max:50}).withMessage('Password Ki tu 6->50!!!'),
    body('confirm_password')
        .custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Confirm password is wrong!!!');
            }
            return true;
        }),
    body('sdt')
        .isLength({min:10,max:10}).withMessage('SDT Ki tu = 10!!!'),
    body('paper_number')
        .isLength({min:8,max:20}).withMessage('Paper Number Ki tu 8->20!!!'),
],asyncHandler(async function (req,res){
    const bank= await Bank.findByAll();
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        return res.render('register', {errors,bank});
    }
    errors = [];
    const user=await User.create({
        email:req.body.email,
        displayName: (req.body.displayname).toUpperCase(),
        password: User.hashPassword(req.body.password),
        bank:req.body.code,
        SDT:req.body.sdt,
        paper_type:req.body.paper_type,
        paper_number:req.body.paper_number,
        birthday:req.body.birthday,
        OTP: crypto.randomBytes(3).toString('hex').toUpperCase(),
    });

    await Account.create({
        id:user.id,
        email:user.email,
        money:0,
        money_USD:0,
        money_save:0,
    })
    await Accept_user.addUser(user.id,user.displayName,user.bank);
    req.session.notification=1;
    return res.redirect('/login');
}));
module.exports = router;