const express = require('express')
const route = express.Router();
const connection = require('../database/connection');
const jsonwebtoken = require('jsonwebtoken')
const validate= require('../middleware/validateMiddleware')
const query = require('../database/query');

const validateUpdateRequest=validate.validateUpdateRequest

//Update users by id
route.put('/:id',validateUpdateRequest,async (req,res)=>{
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
            query: connection.update({
                name:user.name,
                age:user.age,
                gender:user.gender
            }).from('user').where('id',req.params.id).toQuery()
        })
        res.status(202).json({messsage:'Updated'});
    }
    else{
        res.status(400).json({messsage:'Token incorrect!'});
    }
  
});

route.delete('/:id', async (req,res)=>{
    let user = req.body;
    const jwt = user.authorization.substring(7);
    const userExisted = jsonwebtoken.verify(jwt,process.env.JWT_SECRET);
    if(req.params.id == userExisted.id){
        await query.update({
            db: connection,
            query :connection('user').del().where('id',userExisted.id).toQuery()
        })
        res.status(200).json({message:'Deleted user successfully!'})
    }
    else{
        res.status(400).json({message:'User is not existed - Token incorrect!'});
    }
})


module.exports=route