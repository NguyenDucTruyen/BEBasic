let mysql = require("mysql");
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database:'product',
    charset : 'utf8_general_ci'
});
module.exports = connection
