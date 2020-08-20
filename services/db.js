const Sequelize = require('sequelize');

const connectionString = process.env.DATABASE_URL ||'postgres://postgres:953093@localhost:5432/InternetBanking';
const db =new Sequelize(connectionString)

module.exports=db;