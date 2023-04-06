const express = require('express')
const router = express.Router()

var bodyParser = require('body-parser') 

router.use(bodyParser.urlencoded({ extended: false })) 		// parse application/x-www-form-urlencoded
router.use(bodyParser.json())							// parse application/json

function Validate(req,res,next){
	if(typeof req.body.fullname === 'string' && req.body.gender !='True' && req.body.gender !='False' && req.body.age > 0){
		next()
	}
	else{
		res.status(204).send("Không thành công+")
	}
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
router.get('/', (req, res) => {return res.send(list)})

// Tìm kiếm user theo id
router.get('/:id',function (req,res){
	const id = parseInt(req.params.id); // chuyển đổi id thành kiểu số nguyên
	const user = list.find(userTemp => userTemp.id === id); // tìm kiếm người dùng theo id
	if (!user) {
	  return res.status(404).send('Không thể tìm thấy'); // trả về mã trạng thái 404 nếu không tìm thấy người dùng
	}
	else{
		res.send(user); // trả về thông tin người dùng
	}
})


//Put methods
router.put('/:id',Validate,(req,res)=>{
	const id = parseInt(req.params.id)
	const user = list.find(user => user.id === id)
	if(!user){
		return res.status(404).send('Không thể tìm thấy'); 	
	}
	else{
		user.fullname = req.body.fullname
		user.gender = (Boolean) (req.body.gender)
		user.age = parseInt(req.body.age)
		res.status(204).send("ok")
	}
})

// Post methods
	router.post('/',Validate,(req,res)=>{
		const user = req.body
		console.log(user)
		const maxId = list.reduce((max, user) => {
			if (user.id > max) {
			  return user.id;
			} else {
			  return max;
			}
		  }, 0);
		user.id =maxId+1
		list.push(user)
		res.status(201).send(user)
		
	})

// Delete methods
	router.delete('/:id',(req,res)=>{
		const id = parseInt(req.params.id)
		const index = list.findIndex(user => user.id === id)
		if(index !==-1){
			list.splice(index,1)
            res.status(204).send("Deleted")
		}
		else{
			res.status(404).send("Không thể tìm thấy")
		}
	})

    module.exports = router