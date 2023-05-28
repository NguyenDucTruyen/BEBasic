const express = require('express')
const router = express.Router()
const connection = require('../database/connection')
const query = require('../database/query')
const jsonwebtoken = require('jsonwebtoken')
const validate = require('../middleware/validateMiddleware')
const { mailService } = require('../services/mail.service')
const crypto = require('crypto')

const insert = "insert into user(username,password,salt,name,age,gender,email) values(?,?,?,?,?,?,?)"

//End validate
const {
	validateLoginRequest,
	validateRegisterRequest,
	validateUpdateRequest
} = validate

const { hashPassword,
	comparePassword } = require('../helper/hash');
const e = require('express')
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
router.post('/login', validateLoginRequest, async (req, res) => {

	let user = {};
	user.username = req.body.username;
	user.password = req.body.password;
	const isUserExisted = await query.getOne({
		db: connection,
		query: 'select * from user where username =?',
		params: user.username
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
		query: 'select * from user where email =?',
		params: email
	})
	if (!userExisted) {
		res.status(400).json({ message: 'User not exist' })
	}
	else {
		const passwordResetToken = crypto.randomBytes(16).toString('hex');
		const passwordResetExpiration = new Date(Date.now() + 10 * 60 * 1000)
		await query.update({
			db: connection,
			query: 'update user set passwordResetExpiration=?,passwordResetToken=? where email =?',
			params: [passwordResetExpiration, passwordResetToken, email]
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
		query: 'select * from user where email=? and passwordResetToken =? and passwordResetExpiration >= ?',
		params: [email,passwordResetToken,now]
	})
	if(!user){
		res.status(400).json({message:'No infomation'})

	}
	else{
		const passWord_salt = hashPassword(newPassword);
		let password = passWord_salt.hashedPassword;
		let salt = passWord_salt.salt;
		console.log(password);
		try {
			await query.update({
				db: connection,
				query: 'update user set password =?,salt =?,passwordResetToken =null, passwordResetExpiration=null where email=?  ',
				
				params:[password,salt,email]
			})
			res.status(200).json({message:'Reset Password successfully'})
		} catch (error) {
			res.status(400).json({message:'Failed'})
		}
	}
})
module.exports = router