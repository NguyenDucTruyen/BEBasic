const express = require('express')
const route = express.Router();
const connection = require('../database/connection');
const jsonwebtoken = require('jsonwebtoken')
const validate= require('../middleware/validateMiddleware')
const query = require('../database/query');

const validateUpdateRequest=validate.validateUpdateRequest


route.put('/:id',async (req,res)=>{
    let user={
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender
    };
    const token = req.body.authorization;
    const jwt = token.substring(7);
    const userVerified = jsonwebtoken.verify(jwt,process.env.JWT_SECRET)
    if(req.params.id==userVerified.id){
        await query.update({
            db:connection,
            query: 'update user set name=?,age=?,gender=? where id =? ' ,
            params: [user.name,user.age,user.gender,req.params.id]
        })
        res.status(202).json({messsage:'Updated'});
    }
    else{
        res.status(400).json({messsage:'Token incorret!'});
    }
  
})




module.exports=route