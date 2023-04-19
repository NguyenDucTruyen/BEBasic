const { json } = require('body-parser');
const jsonwebtoken = require('jsonwebtoken');
// const secret ='TruyenTrTr';
const user ={
    name:"QQQ"
    ,org:"BADU"
};


// const jwt = jsonwebtoken.sign(user,secret,{
//     algorithm:'HS384',
// });
// console.log(jwt)

let token ='eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXalQifQ.eyJuYW1lIjoiUUhRIiwib3JnIjoiQkFEVSIsImlhdCI6MTY4MTczNjA4NX0.v6RmwHOV6fH7S5KlAc0_Y8k3ZNQvANDvnjWSaq_Ye7badEv9TKIugUlFZ0i5anKg'
const secret ='TruyenTruyen'
// console.log(jsonwebtoken.sign(user,secret))
token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVk4iLCJvcmciOiJRVUFOQ09ORyIsImlhdCI6MTY4MTczNzU0NH0.FMgzo8B5xxdBVvrOFtN9CnLgRMUPx2z9ClIAwYUBEgI'
const isTokenValue =jsonwebtoken.verify(token,'cmon')
console.log(isTokenValue)