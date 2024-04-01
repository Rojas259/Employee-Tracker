const mysql2 = require('mysql2');
const sequelize = require('../Tec-Blog/config/connection');
require('dotenv').config();


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.on('error', (err) => {
  console.error('MySQL connection error:', err.stack);
});

module.exports = sequelize;