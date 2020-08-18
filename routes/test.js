const {Router}=require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler=require('express-async-handler');
const crypto=require('crypto');
const User=require('../services/user');
const Email=require('../services/email');
const Bank=require('../services/bank');
const Transfer=require('../services/transfer');
var schedule = require('node-schedule');
const router = new Router();

var errors=[];

router.get('/', function (req,res){
    var numb = 123.238;
    numb = numb.toFixed(2);
    console.log(numb);
    console.log(numb);
    console.log(numb);
    console.log(numb);
    console.log(numb);
    console.log(numb);
    console.log(numb);

    



    return res.render('test');
});

router.post('/',asyncHandler(async function (req,res){
    
    return res.render('test');
}));

module.exports = router;