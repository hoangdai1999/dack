const bcrypt=require('bcrypt');
const db=require('./db');
const Sequelize=require('sequelize');

const Model=Sequelize.Model;

class Bank extends Model {
    static async findById(id){
        return Bank.findByPk(id);
    }

    static async findByCode(code){
        return Bank.findOne({
            where: {
                code,
            }
        });
    }

    static async findByAll(){
        return Bank.findAll({raw: true});
    }
 }
Bank.init({
    Name:{
        type: Sequelize.STRING,
        allowNull: false,        
        unique: true,
    },
    code:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    same_bank:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    other_banks: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: db,
    modelName:'bank',
});

module.exports= Bank;