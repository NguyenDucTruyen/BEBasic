const express = require('express')
const router = express.Router()
const connection = require('../database/connection')
const query = require('../database/query')
const jsonwebtoken = require('jsonwebtoken')
const validate = require('../middleware/validateMiddleware')
const insert = "insert into user(username,password,salt,name,age,gender,email) values(?,?,?,?,?,?,?)"

//End validate
const {
	validateLoginRequest,
	validateRegisterRequest,
	validateUpdateRequest
}=validate

const { hashPassword,
	comparePassword } = require('../helper/hash');
// Register user
router.post('/register', validateRegisterRequest, async (req, res) => {
	let user = {};
	user.username = req.body.username;
	user.name = req.body.name;
	user.age = req.body.age;
	user.email = req.body.email;
	user.gender = req.body.gender;
	const userExisted = await query.getOne({
		db: connection,
		query: 'select * from user where username =?',
		params: user.username
	});
	if (userExisted) {
		res.status(400).json("Existed user");
	}
	else {
		const passWord_salt = hashPassword(req.body.password);
		user.password = passWord_salt.hashedPassword;
		user.salt = passWord_salt.salt;

		await query.create({
			db: connection,
			query: insert,
			params: [user.username, user.password, user.salt, user.name, user.age, user.gender, user.email]
		});
		res.status(201).json(user);
	}

});


// Login user
router.post('/login',validateLoginRequest,async (req,res)=>{
	
	let user={};
	user.username = req.body.username;
	user.password = req.body.password;
	const isUserExisted = await query.getOne({
		db: connection,
		query: 'select * from user where username =?',
		params: user.username
	});
	if(isUserExisted){
		const checkPassword = comparePassword(isUserExisted.password,isUserExisted.salt,user.password)
		if(checkPassword){
			const jwt=jsonwebtoken.sign({
				id: isUserExisted.id,
				username: isUserExisted.username,
				name: isUserExisted.name,
				gender: isUserExisted.gender,
				email: isUserExisted.email,
				age: isUserExisted.age,
			},process.env.JWT_SECRET,{
				algorithm: 'HS256',
				expiresIn:'2h',
			});
			return res.status(200).json({
				data: jwt,
				message:'Login success',
			});
		}
		else{
			res.status(401).json({message:'Password incorrect!'});
		}
	}
	else{
		res.status(404).json({message:'Not found user'});
	}

})

// //Get methods
// router.get('/', (req, res) => {
// 	let arrayUser=[] 
// 	connection.query('select * from user',(err,rs)=>{
// 		if(err) throw err;
// 		return res.send(rs)

// 	})

// })

// // Tìm kiếm user theo id
// router.get('/:id',function (req,res){
// 	connection.query('select * from user',(err,rs)=>{
// 		if(err) throw err;
// 		const id = parseInt(req.params.id); // chuyển đổi id thành kiểu số nguyên
// 		const user = rs.find(userTemp => userTemp.id === id); // tìm kiếm người dùng theo id
// 		if (!user) {
// 		return res.status(404).send('Không thể tìm thấy'); // trả về mã trạng thái 404 nếu không tìm thấy người dùng
// 		}
// 		else{
// 			return res.send(user); // trả về thông tin người dùng
// 		}
// 	})

// })


// //Put methods
// router.put('/:id',Validate,(req,res)=>{
// 	const id = parseInt(req.params.id)
// 	let user={}
// 	user.fullname = req.body.fullname
// 	user.gender = (Boolean) (req.body.gender)
// 	user.age = parseInt(req.body.age)
// 	connection.query('update user set fullname=?,gender=?,age=? where id =?',[user.fullname,user.gender,user.age,id])
// 	res.status(204).send("ok")

// })


// // Post methods
// 	router.post('/',Validate,(req,res)=>{
// 		const user = req.body
// 		connection.query('insert into user(fullname,gender,age)'+
// 		'values(?,?,?)',[user.fullname,Boolean(user.gender),parseInt(user.age)],(err, rs)=>{
// 			console.log(err)
// 		})
// 		res.status(201).send(user)

// 	})

// // Delete methods
// 	router.delete('/:id',(req,res)=>{
// 		const id = parseInt(req.params.id)
// 		connection.query('select * from user where id =?',id,(err,rs)=>{
// 			if(err) res.send(err)
// 			else
// 				if(!rs)
// 				res.status(404).send("Không thể tìm thấy")
// 				else
// 					{
// 						connection.query('delete from user where id =?',id,(err,rs)=>{
// 							if(err) res.send(err)
// 							else
// 							res.status(204).send("Deleted")
// 						})	
// 					}
// 		})


// 	})


module.exports = router