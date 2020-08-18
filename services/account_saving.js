const bcrypt=require('bcrypt');
const db=require('./db');
const Sequelize=require('sequelize');
const User=require('../services/user');
const Interest_rate=require('../services/interest_rate');
const Notification=require('../services/notification');
const Account=require('../services/account');
const Email=require('../services/email');
const Bank=require('../services/bank');

const Model=Sequelize.Model;

class Account_saving extends Model {
    static async findByPk(id){
        return Account_saving.findOne({
            where:{
                id,
            }
        });
    };

    static async findBySTK(STK){
        return Account_saving.findOne({
            where:{
                STK,
            }
        });
    };

    static async deleteById(STK){
        return Account_saving.destroy({
            where:{
                STK,
            }
        });
    }

    static async addAccount_saving(STK,month,sent_date,date_received,rate,money_rate,money,total_money){
        return this.create({
            STK,
            month,
            sent_date,
            date_received,
            rate,
            money_rate,
            money,
            total_money,
        }).then(temp => temp);
    }

 };
 
Account_saving.init({
    STK:{
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
    },
    month:{
        type: Sequelize.STRING,
    },
    rate:{
        type: Sequelize.FLOAT,
    },
    money_rate:{
        type: Sequelize.INTEGER,
    },
    sent_date:{
        type: Sequelize.STRING,
    },    
    date_received:{
        type: Sequelize.STRING,
    }, 
    money:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    total_money: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    check: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: db,
    modelName:'account_saving',
});


module.exports= Account_saving;