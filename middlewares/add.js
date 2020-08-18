const Bank=require('../services/bank');
const interest_rate=require('../services/interest_rate');
const User=require('../services/user');
const asyncHandler=require('express-async-handler');

module.exports= asyncHandler(async function auth(req,res,next){
    var temp='hoangdai@gmail.com';
    var temp_2=(await User.findByEmail(temp));
    if(!temp_2){
        User.create({
            email:'hoangdai@gmail.com',
            displayName: ('hoang nguyen dai').toUpperCase(),
            password: User.hashPassword('123123123'),
            bank:'ACB',
            staff:true,
        });
    };

    temp='hndai17ck1@gmail.com';
    temp_2=(await User.findByEmail(temp));
    if(!temp_2){
        User.create({
            email:'hndai17ck1@gmail.com',
            displayName: ('hoang nguyen dai').toUpperCase(),
            password: User.hashPassword('123123123'),
            bank:'Agribank',
            staff:true,
        });
    };
    
    interest_rate.bulkCreate([
        {month:1, rate:3.7,},
        {month:3, rate:3.75,},
        {month:6, rate:5.7,},
        {month:12, rate:5.9,},
        {month:18, rate:6,}
    ]);
    
    Bank.bulkCreate([
        {Name:'ACB - Ngan hang TMCP A Chau', code:'ACB', same_bank:1000, other_banks:3000,},
        {Name:'Agribank- Ngan hang NN va Phat trien NT VN', code:'Agribank', same_bank:2000, other_banks:3000,}
    ]);
    next();
});