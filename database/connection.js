let mysql = require("mysql");
let dotenv = require('dotenv')
dotenv.config()

// let connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database:process.env.DB_NAME,
// });

let connection = mysql.createConnection({
    host: PROCESS.ENV.DB_HOST,
    user: PROCESS.ENV.DB_USER,
    password: PROCESS.ENV.DB_PASSWORD,
    database: PROCESS.ENV.DB_NAME
});
module.exports = connection
