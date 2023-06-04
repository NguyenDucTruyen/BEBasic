const express = require('express')
const route = express.Router();
const connection = require('../database/connection');
const jsonwebtoken = require('jsonwebtoken')
const validate= require('../middleware/validateMiddleware')
const query = require('../database/query');

const validateUpdateRequest=validate.validateUpdateRequest
const validateSearchRequest = validate.validateSearch
const checkAdmin = validate.checkAdmin
const { hashPassword,
	comparePassword } = require('../helper/hash');
//Pagination 
route.get('/searchPanigation',validateSearchRequest,async (req,res)=>{
    let name = req.body.name
    let pageNumber = parseInt(req.body.pageNumber);
    let pageSize = parseInt(req.body.pageSize);
    let skip = parseInt((pageNumber-1)*pageSize);
    const userExisted = await query.getAll({
		db: connection,
		query: connection('user').select().whereLike('name',`%${name}%`).limit(pageSize).offset(skip).toQuery()
	});
    let users =[]
    if(!userExisted){
       
        res.status(400).json({message: 'No one'})
    }
    else{
        for(let i =0;i<userExisted.length;i++)
        users[i]={
            id: userExisted[i].id,
            name: userExisted[i].name
        }
        res.status(200).json({message: users})
    }
})

//Update users by id
route.put('/:id',[checkAdmin,validateUpdateRequest],async (req,res)=>{
    let user={
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender
    };
    let userOrigin = await query.getOne({
        db:connection,
        query: connection('user').select().where('id',req.params.id).toQuery()
    })
    if(userOrigin){
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
        res.status(400).json({messsage:'User does not exist'});
    }
  
});

//Delete user
route.delete('/:id',checkAdmin, async (req,res)=>{
    
    const jwt = req.headers.authorization.substring(7);
    const userExisted = jsonwebtoken.verify(jwt,process.env.JWT_SECRET);
    let user = await query.getOne({
        db:connection,
        query: connection('user').select().where('id',req.params.id).toQuery()
    })
    if(user){
        await query.update({
            db: connection,
            query :connection('user').del().where('id',user.id).toQuery()
        })
        res.status(200).json({message:'Deleted user successfully!'})
    }
    else{
        res.status(400).json({message:'User is not existed - Token incorrect!'});
    }
})
// create user by Admin
route.post('/create',checkAdmin, async (req, res) => {
	let user = {};
	user.username = req.body.username;
	user.name = req.body.name;
	user.age = req.body.age;
	user.email = req.body.email;
	user.gender = req.body.gender;
	const jwt = req.headers.authorization.substring(7);
    const timeCreate = new Date(Date.now())

	const userExisted = await query.getOne({
		db: connection,
		query: connection.select().from('user').where('username',user.username).toQuery()
	});
	if (userExisted) {
		res.status(400).json({message:userExisted});
	}
	else {
		const passWord_salt = hashPassword(req.body.password);
		user.password = passWord_salt.hashedPassword;
		user.salt = passWord_salt.salt;

		await query.create({
			db: connection,
			query: connection.insert({
				username:user.username,
				password: user.password,
				salt: user.salt,
				name: user.name,
				age: user.age,
				gender:user.gender,
				email:user.email,
				createdBy: req.adminID,
				createdAt: timeCreate
			}).into('user').toQuery()
		});
		res.status(201).json(user);
	}

});


module.exports=route