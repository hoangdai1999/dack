const db=require('./db');
const Sequelize=require('sequelize');

const Model=Sequelize.Model;

class Notification extends Model {
    static async findById(id){
        return Notification.findByPk(id);
    }

    static async findByIdAll(STK){ 
        return Notification.findAll({
            where: {
                STK,
            }
        });
    }

    static async findById_DateAll(STK,date_name){
        return Notification.findAll({
            where: {
                STK,
                date_name,
            }
        });
    }

    static async addNotification(STK,notification,date_name){
        return this.create({
            STK,
            notification,
            date_name,
        }).then(temp => temp);
    }
 };
Notification.init({
    STK:{
        type: Sequelize.INTEGER,
    },
    notification:{
        type: Sequelize.STRING(500),
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW(),
    },
    date_name: {
        type: Sequelize.STRING,
    },
}, {
    sequelize: db,
    modelName:'notification',
});

module.exports= Notification;