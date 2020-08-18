const db=require('./db');
const Sequelize=require('sequelize');
const Account_saving=require('../services/account_saving');

const Model=Sequelize.Model;

class Interest_rate extends Model {
    static async findByMonth(month){
        return Interest_rate.findOne({
            where:{
                month,
            }
        });
    };

    static async sent_date(){
        var today = new Date();
        var date= today.toISOString();
        var date_name=date.substring(0,10);
        return date_name;
    };

    static async sum_day(STK){
        const account_saving=await Account_saving.findBySTK(STK);
        const today= await Interest_rate.sent_date();
        if(today==account_saving.date_received || account_saving.check==true){
            return 0;
        }
        else{
            var sent_date=new Date(today);
            var day_sent=sent_date.getDate();
            var month_sent=sent_date.getMonth();
            var year_sent=sent_date.getFullYear();

            var received_date=new Date(account_saving.date_received);
            var day_received=received_date.getDate();
            var month_received=received_date.getMonth();
            var year_received=received_date.getFullYear();
            

            return (30 - day_sent + day_received + (11-month_sent+month_received+(year_received-year_sent-1)*12)*30);
        }
    };
 };
 
 Interest_rate.init({
    month:{
        type: Sequelize.INTEGER,
        allowNull: false,        
        unique: true,
    },
    rate:{
        type: Sequelize.FLOAT,
    },
}, {
    sequelize: db,
    modelName:'interest_rate',
});


module.exports= Interest_rate;