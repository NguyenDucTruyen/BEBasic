let connection = require('../database/connection')

connection.query("select * from user",(err,rs)=>{
    console.log(err)
    console.log(rs)
})


// connection.query('SELECT * FROM user', (error, results, fields) => {
//     if (error) throw error;
//     arrayUser = results.map(result => {
//       const object = {};
//       for (const property in result) {
//         object[property] = result[property];
//       }
//       return object;
//     });
//   });
//   console.log(arrayUser)