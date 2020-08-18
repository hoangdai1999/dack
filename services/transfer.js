const db=require('./db');
const Sequelize=require('sequelize');
const crypto=require('crypto');
const User=require('../services/user');
const Bank=require('../services/bank');
const Model=Sequelize.Model;

//type 1: thông báo chuyển tiền
//type 2: thông báo nhận tiền từ khách hàng chuyển
//type 3: thông báo nhận tiền từ nhân viên chuyển
class Transfer extends Model {
    //hàm này tìm theo id 
    static async findById(id){
        return Transfer.findByPk(id);
    }

    //hàm này tìm tất cả email của STK đó
    static async findByEmail(STK_acc){
        Transfer.findAll({
            where: {
                STK_acc,
            }
        }).then(arr => arr.forEach(temp =>{
            if(temp.OTP!=null){
                Transfer.destroy({
                    where:{
                        id: temp.id,
                    }
                });
            }
        }));
        return Transfer.findAll({
            where: {
                STK_acc,
            }
        });
    }

    //hàm này thêm thông tin người gửi
    static async addTransfer_sender(STK_acc,STK,money,description,currency_unit,date){
        return this.create({
            STK_acc,
            STK,
            date,
            type:1,
            money,
            description,
            currency_unit,
            OTP:crypto.randomBytes(3).toString('hex').toUpperCase(),
        }).then(temp => temp);
    }

    //hàm này thêm thông tin người nhận
    static async addTransfer_receiver(STK_acc,STK,money,description,currency_unit,date){
        return this.create({
            STK_acc,
            STK,
            date,
            type:2,
            money,
            description,
            currency_unit,
        }).then(temp => temp);
    }

    //hàm này thêm thông tin bank
    static async addTransfer_bank(STK_acc,money,bank,currency_unit,date){
        return this.create({
            STK_acc,
            type:3,
            date,
            money,
            bank,
            currency_unit,
        }).then(temp => temp);
    }

    //hàm này lọc ra tất cả hnay người đó gửi có quá mức quy định hay không(200tr)
    static async findAllSTK_sender(STK_acc,date,currency_unit){
        var sum=0;
        Transfer.findAll({
            where: {
                STK_acc,
                date,
                type:1,
                currency_unit,
            }}).then(arr => arr.forEach(temp =>{
                if(temp.OTP==null){
                    sum+=temp.money
                }
                else{
                    Transfer.destroy({
                        where:{
                            id: temp.id,
                        }
                    })
                }
            }));
        return sum;
    }

    //hàm này xóa id khi ng gửi đó đã gửi quá hạn số tiền trong 1 ngày gửi
    static async deleteById(id){
        return Transfer.destroy({
            where:{
                id,
            }
        });
    }

 };

Transfer.init({
    STK_acc: {
        type: Sequelize.STRING,
    },
    STK:{
        type: Sequelize.STRING,
    },
    type:{
        type: Sequelize.INTEGER,
    },
    money: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    currency_unit:{
        type: Sequelize.STRING,//đơn vị tiền tệ
    },
    description: {
        type: Sequelize.STRING,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    tax: {
        type: Sequelize.INTEGER,
    },
    bank: {
        type: Sequelize.STRING,
    },
    OTP: {
        type: Sequelize.STRING,
    },
}, {
    sequelize: db,
    modelName:'transfer',
});

module.exports= Transfer;