const express = require('express')
const router = express.Router()
const connection = require('../database/connection')
let maxId = 0;


function nameValidate(name) {
	const pattern = /^[a-zA-ZÀ-ỹạẠảẢấẤầẦẩẨẫẪậẬắẮằẰẳẲẵẴặẶéÉèÈẻẺẽẼẹẸêÊếẾềỀểỂễỄệỆíÍìÌỉỈĩĨ//ịỊóÓòÒỏỎõÕọỌôÔốỐồỒổỔỗỖộỘơƠớỚờỜởỞỡỠợỢúÚùÙủỦũŨụỤưỨỨừỪửỬữỮựỰýÝỳỲỷỶỹỸ\s]+$/;
	return pattern.test(name); // Trả về true/false
  }
  function fullNameValidate(name) {
	if (!name || name.length < 2 || name.length > 50) {
	  	return false 		// Độ dài tên có vấn đề
	}  
	else if (!nameValidate(name)) {
	  	return false 		// "Tên không được chứa ký tự đặc biệt hoặc số!";
	}
	return true;
  }
  
function Validate(req,res,next){
	if(fullNameValidate(req.body.fullname) && req.body.gender !='True' && req.body.gender !='False' && req.body.age > 0 && req.body.age <120){
		
		next()
	}
	else{
		
		res.status(204).send("Không thành công")
	}
}
function getMaxID(array){
	maxId = array.reduce((max, user) => {
	   if (user.id > max) {
		 return user.id;
	   } else {
		 return max;
	   }
	 }, maxId);
	 return maxId
}

let list=[
	{
		"id": 1,
		"fullname": "Nguyen Huy Tuong",
		"gender": true,
		"age": 18
	},
	{
		"id": 2,
		"fullname": "Nguyen Thi Tuong",
		"gender": false,
		"age": 15
	}
]

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

    module.exports = router