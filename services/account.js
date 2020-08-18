const bcrypt=require('bcrypt');
const db=require('./db');
const Sequelize=require('sequelize');
const User=require('../services/user');
const Bank=require('../services/bank');

const Model=Sequelize.Model;

class Account extends Model {
    static async findById(id){
        return Account.findByPk(id);
    }

    //hàm này check xem acc_bank của ng gửi có đủ số tiền đó để gửi hay k
    static async check_money_Bank(STK_acc,STK,money){
        const x=Number(money);
        const user_acc= await User.findById(STK_acc);
        const user_rec= await User.findById(STK);
        const bank= await Bank.findByCode(user_acc.bank);
        const acc = await Account.findById(STK_acc);
        var temp=0;
        if(user_acc.bank==user_rec.bank){
            temp=bank.same_bank;
        }
        else{
            temp=bank.other_banks;
        }
        console()
        if((acc.money-(x+temp))>0){
            return true;
        }
        else{
            return false;
        }
    }
 };
 
Account.init({
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    money:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    money_USD:{
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    money_save: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: db,
    modelName:'account',
});


module.exports= Account;