const { json } = require('body-parser');
const express = require('express');
const app=express();
const jsonwebtoken = require('jsonwebtoken');

let bodyParser = require('body-parser') 
app.use(bodyParser.urlencoded({ extended: false })) 		// parse application/x-www-form-urlencoded
app.use(bodyParser.json())	
const secret = 'Truyen-Truyen'
const dbs=[
    {
        username: 'thinh',
        age: 22,
        email:'thinh@gmail.com',
        id:1,
        password:'thinh12345',
        balance: 1000000
    },
    {
        username: 'phu',
        age: 24,
        email:'phu@gmail.com',
        id:2,
        password:'phu12345',
        balance: 100000000
    }
]

// app.use(express.json());

app.post('/login',function(req,res,next){

    const username=req.body.username;
    const password=req.body.password;
    const user = dbs.find(x=>x.username===username);
// Trường họp không tìm thấy user
    if(!user){
        res.status(400).json({
            message:'User not found',
        });
    }
//Trường hợp tìm được user
    if(user.password === password){
        const jwt=jsonwebtoken.sign({
            username: user.username,
            email: user.email,
            age: user.age,
        },secret,{
            algorithm: 'HS256',
            expiresIn:'2h',
        });
        return res.status(200).json({
            data: jwt,
            message:'Login success',
        });
    }
/** Trường hợp sai mật khẩu**/
    return res.status(401).json({
        message:'Invalid credentials',
    });
});

app.get('/balance',(req,res,next)=>{
    const username = req.query.username
    const authorizationHeader = req.headers.authorization
    const userToken = authorizationHeader.substring(7);
    
    // verify token
    try{
        const isTokenValid=jsonwebtoken.verify(userToken,secret);
        //Authorization success
        if(isTokenValid.username==username){
            const user = dbs.find(x=>x.username===isTokenValid.username);
            return res.status(200).json({
                balance: user.balance,
            });
        }
        //Authorization Failed
        return res.status(401).json({
            message:'unauthorized',
        });
    }
    catch(error){
        return res.status(401).json({
            message:"Loi"+ error.message
        })
    }

})
app.listen(3030,()=>{
    console.log(`Listening on port 3030`)
});
