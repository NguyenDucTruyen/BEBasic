let connection = require('./database/connection')

connection.query("select * from user",(err,rs)=>{
    console.log(err)
    console.log(rs)
})