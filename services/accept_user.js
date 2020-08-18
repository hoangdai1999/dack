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

class Accept_user extends Model {
    static async findByPk(id){
        return Accept_user.findOne({
            where:{
                id,
            }
        });
    };

    static async findByAll_STK(bank_acc){
        return Accept_user.findAll({
            where:{
                bank_acc,
            }
        });
    };

    static async findByAll_STK_bank(STK,bank_acc){
        return Accept_user.findAll({
            where:{
                STK,
                bank_acc,
            }
        });
    };

    static async deleteById(id){
        return Accept_user.destroy({
            where:{
                id,
            }
        });
    }

    static async addUser_send(id_send,STK,displayName,money,currency,STK_rec,displayName_rec,bank,bank_name,bank_acc){
        return this.create({
            id_send,
            STK,
            displayName,
            type:1,
            money,
            currency,
            STK_rec,
            displayName_rec,
            bank,
            bank_name,
            bank_acc,
        }).then(temp => temp);
    }

    static async addUser_receive(id_send,STK,displayName,money,currency,STK_rec,displayName_rec,bank,bank_name,bank_acc){
        return this.create({
            id_send,
            STK,
            displayName,
            type:2,
            money,
            currency,
            STK_rec,
            displayName_rec,
            bank,
            bank_name,
            bank_acc,
        }).then(temp => temp);
    }

    static async addUser_saving(id_send,STK,displayName,money,total_money,month,date,bank_acc){
        return this.create({
            id_send,
            STK,
            displayName,
            type:3,
            money,
            total_money,
            month,
            date,
            bank_acc,
        }).then(temp => temp);
    }

    static async addUser_accept_pass(STK,displayName,bank_acc){
        return this.create({
            STK,
            displayName,
            type:4,
            bank_acc,
        }).then(temp => temp);
    }

    static async addUser_transaction_lock(STK,displayName,bank_acc){
        return this.create({
            STK,
            displayName,
            type:5,
            bank_acc,
        }).then(temp => temp);
    }

    static async addUser_account_lock(STK,displayName,bank_acc){
        return this.create({
            STK, 
            displayName,
            type:6,
            bank_acc,
        }).then(temp => temp);
    }

    static async addUser(STK,displayName,bank_acc){
        return this.create({
            STK,
            displayName,
            type:7,
            bank_acc,
        }).then(temp => temp);
    }

 };
 
 Accept_user.init({
    id_send:{
        type: Sequelize.INTEGER,//gửi tiền 
    },
    STK:{
        type: Sequelize.INTEGER,//gửi tiền && tiết kiệm
        allowNull: false,
    },
    displayName:{
        type: Sequelize.STRING,//gửi tiền && tiết kiệm
    },
    bank_acc:{
        type: Sequelize.STRING,//gửi tiền 
    },
    type:{
        type: Sequelize.INTEGER,//1: gửi tiền -- 2:người nhận -- 3: gửi tài khoản tiết kiệm -- 4: đổi password -- 5: khóa giao dịch -- 6:lock acc -- 7:accept đăng kí tài khoản
    },
    money:{
        type: Sequelize.INTEGER,//gửi tiền && tiết kiệm
    },
    currency:{
        type: Sequelize.STRING,//gửi tiền 
    },
    STK_rec:{
        type: Sequelize.INTEGER,//gửi tiền 
    },
    displayName_rec:{
        type: Sequelize.STRING,//gửi tiền && tiết kiệm
    },
    bank:{
        type: Sequelize.STRING,//gửi tiền 
    },
    bank_name:{
        type: Sequelize.STRING,//gửi tiền 
    },
    total_money: {
        type: Sequelize.INTEGER,// tiết kiệm
    },
    month:{
        type: Sequelize.INTEGER,//tiết kiệm
    },
    date:{
        type: Sequelize.STRING,//tiết kiệm
    },
}, {
    sequelize: db,
    modelName:'accept_user',
});


module.exports= Accept_user;