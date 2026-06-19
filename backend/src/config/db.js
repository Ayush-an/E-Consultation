require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'defaultdb';
const DB_USER = process.env.DB_USER || 'avnadmin';
const DB_PASS = process.env.DB_PASS; // Removed the hardcoded string!
const DB_HOST = process.env.DB_HOST || 'mysql-7b0f128-agrawalayushl.i.aivencloud.com';
const DB_PORT = process.env.DB_PORT || 28086;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT, 
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false 
    }
  }
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;