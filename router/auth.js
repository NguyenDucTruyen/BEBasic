const express = require('express')
const router = express.Router()
const connection = require('../database/connection')
const query = require('../database/query')
const jsonwebtoken = require('jsonwebtoken')
const validate = require('../middleware/validateMiddleware')
const { mailService } = require('../services/mail.service')
const crypto = require('crypto')

const insert = "insert into user(username,password,salt,name,age,gender,email) values(?,?,?,?,?,?,?)"

//validate
const 
	validateLoginRequest = validate.validateLoginRequest,
	validateRegisterRequest = validate.validateRegisterRequest,
	validateUpdateRequest = validate.validateUpdateRequest,
	checkAdmin = validate.checkAdmin

const { hashPassword,
	comparePassword } = require('../helper/hash');
const e = require('express')
const { route } = require('./user')
const { json } = require('body-parser')

// Register user - not admin
router.post('/register', validateRegisterRequest, async (req, res) => {
	let user = {};
	user.username = req.body.username;
	user.name = req.body.name;
	user.age = req.body.age;
	user.email = req.body.email;
	user.gender = req.body.gender;
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

			}).into('user').toQuery()
		});
		res.status(201).json(user);
	}

});

// Login user
router.post('/login', validateLoginRequest, async (req, res) => {

	let user = {};
	user.username = req.body.username;
	user.password = req.body.password;
	const isUserExisted = await query.getOne({
		db: connection,
		query: connection.select().from('user').where('username',user.username).toQuery()
	});
	if (isUserExisted) {
		const checkPassword = comparePassword(isUserExisted.password, isUserExisted.salt, user.password)
		if (checkPassword) {
			const jwt = jsonwebtoken.sign({
				id: isUserExisted.id,
				username: isUserExisted.username,
				name: isUserExisted.name,
				gender: isUserExisted.gender,
				email: isUserExisted.email,
				age: isUserExisted.age,
				isAdmin: isUserExisted.isAdmin
			}, process.env.JWT_SECRET, {
				algorithm: 'HS256',
				expiresIn: '2h',
			});
			return res.status(200).json({
				data: jwt,
				message: 'Login success',
			});
		}
		else {
			res.status(401).json({ message: 'Password incorrect!' });
		}
	}
	else {
		res.status(404).json({ message: 'Not found user' });
	}

})
// Send email
router.post('/sendemail', async function (req, res) {
	let email = {}
	email.from = 'abc@gamil.com'
	email.to = req.body.email
	email.subject = req.body.subject
	email.text = req.body.text

	await mailService.sendEmail({
		emailFrom: email.from,
		emailTo: email.to,
		emailSubject: email.subject,
		emailText: email.text
	})
	return res.status(200).json(email)

})
router.post('/forgot-password', async function (req, res) {
	let email;
	email = req.body.email;
	const userExisted = await query.getOne({
		db: connection,
		query: connection.select().from('user').where('email',email).toQuery()
	})
	if (!userExisted) {
		res.status(400).json({ message: 'User not exist' })
	}
	else {
		const passwordResetToken = crypto.randomBytes(16).toString('hex');
		const passwordResetExpiration = new Date(Date.now() + 10 * 60 * 1000)
		await query.update({
			db: connection,
			query: connection.update({
				passwordResetExpiration:passwordResetExpiration,
				passwordResetToken:passwordResetToken
			}).from('user').where('email',email).toQuery()
		})
		try {

			await mailService.sendEmail({
				emailFrom: 'truyen@gmail.com',
				emailTo: email,
				emailSubject: 'Reset Password',
				emailText: passwordResetToken
			})
			res.status(200).json({ message: 'Send resetPasswordToken successfully' })
		} catch (error) {
			res.status(400).json({ message: 'Send resetPasswordToken failed' })
		}
	}
})
router.post('/reset-password', async function(req,res){
	let email = req.body.email;
	let passwordResetToken = req.body.passwordResetToken;
	let newPassword = req.body.newPassword;
	let now = new Date(Date.now());
	const user = await query.getOne({
		db: connection,
		query: connection.select().from('user').where('email',email).andWhere('passwordResetToken',passwordResetToken)
		.andWhere('passwordResetExpiration','>=',now).toQuery()
	})
	if(!user){
		res.status(400).json({message:'No infomation'})
	}
	else{
		const passWord_salt = hashPassword(newPassword);
		let password = passWord_salt.hashedPassword;
		let salt = passWord_salt.salt;
		try {
			await query.update({
				db: connection,
				query: connection.update({
					password :password,
					salt :salt,
					passwordResetToken :null,
					passwordResetExpiration:null
				}).from('user').where('email',email).toQuery()
				
			})
			res.status(200).json({message:'Reset Password successfully'})
		} catch (error) {
			res.status(400).json({message:'Failed'})
		}
	}
})
module.exports = router