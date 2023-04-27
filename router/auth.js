const express = require('express')
const router = express.Router()
const connection = require('../database/connection')
const query = require('../database/query')

const insert ="insert into user(username,password,name,age,gender,email) values(?,?,?,?,?,?)"
let maxId = 0;



  function fullNameValidate(name) {
	const pattern = /^[a-zA-ZÀ-ỹạẠảẢấẤầẦẩẨẫẪậẬắẮằẰẳẲẵẴặẶéÉèÈẻẺẽẼẹẸêÊếẾềỀểỂễỄệỆíÍìÌỉỈĩĨ//ịỊóÓòÒỏỎõÕọỌôÔốỐồỒổỔỗỖộỘơƠớỚờỜởỞỡỠợỢúÚùÙủỦũŨụỤưỨỨừỪửỬữỮựỰýÝỳỲỷỶỹỸ\s]+$/;
	if (!name || name.length < 2 || name.length > 50) {
	  	return false 		// Độ dài tên có vấn đề
	}
	else if(!pattern.test(name)){
		return false;
	}
	return true;
  }
  function validateEmail(email) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
  }
function Validate(req,res,next){

	if(!fullNameValidate(req.body.username)){
		res.status(204).send("Tên không hợp lệ");
	}
	else if(req.body.password != req.body.passwordagain){
		res.status(204).send("Mật khẩu nhập lại không đúng");
	}
	else if(req.body.gender !='1' && req.body.gender !='0'){
		res.status(204).send("Giới tính hợp lệ")
	}
	else if(req.body.age < 0 || req.body.age >120)
	{
		res.status(204).send("Độ tuổi không hợp lệ")
	}
	else if(!fullNameValidate(req.body.name)){
		res.status(204).send("Tên không hợp lệ");
	}
	else if(!validateEmail(req.body.email)){
		res.status(204).send("Email không hợp lệ");
	};

	next();
	
}
// Register user
router.post('/register',Validate,async (req,res)=>{
	const user = req.body;
	await query.create({
		db:connection,
		query:insert,
		params:[user.username,user.password,user.name,user.age,user.gender,user.email]
	});
	
})

//Get methods
router.get('/', (req, res) => {
	let arrayUser=[] 
	connection.query('select * from user',(err,rs)=>{
		if(err) throw err;
		return res.send(rs)
		
	})

})

// Tìm kiếm user theo id
router.get('/:id',function (req,res){
	connection.query('select * from user',(err,rs)=>{
		if(err) throw err;
		const id = parseInt(req.params.id); // chuyển đổi id thành kiểu số nguyên
		const user = rs.find(userTemp => userTemp.id === id); // tìm kiếm người dùng theo id
		if (!user) {
		return res.status(404).send('Không thể tìm thấy'); // trả về mã trạng thái 404 nếu không tìm thấy người dùng
		}
		else{
			return res.send(user); // trả về thông tin người dùng
		}
	})
	
})


//Put methods
router.put('/:id',Validate,(req,res)=>{
	const id = parseInt(req.params.id)
	let user={}
	user.fullname = req.body.fullname
	user.gender = (Boolean) (req.body.gender)
	user.age = parseInt(req.body.age)
	connection.query('update user set fullname=?,gender=?,age=? where id =?',[user.fullname,user.gender,user.age,id])
	res.status(204).send("ok")
	
})


// Post methods
	router.post('/',Validate,(req,res)=>{
		const user = req.body
		connection.query('insert into user(fullname,gender,age)'+
		'values(?,?,?)',[user.fullname,Boolean(user.gender),parseInt(user.age)],(err, rs)=>{
			console.log(err)
		})
		res.status(201).send(user)
		
	})

// Delete methods
	router.delete('/:id',(req,res)=>{
		const id = parseInt(req.params.id)
		connection.query('select * from user where id =?',id,(err,rs)=>{
			if(err) res.send(err)
			else
				if(!rs)
				res.status(404).send("Không thể tìm thấy")
				else
					{
						connection.query('delete from user where id =?',id,(err,rs)=>{
							if(err) res.send(err)
							else
							res.status(204).send("Deleted")
						})	
					}
		})
		
		
	})

	// router.post('/register',)

    module.exports = router