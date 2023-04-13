let conn = require('./connection')

let create ='create table user('+
	'id int auto_increment primary key,'+
    'fullname nvarchar(255),'+
    'gender boolean,'+
    'age int'+
    
')'
let user1={
    "fullname": "Nguyen Huy Tuong",
    "gender": true,
    "age": 18
}
let user2 = {
    "fullname": "Nguyen Thi Tuong",
    "gender": false,
    "age": 15
}

//Tạo table user
conn.query(create,(err, rs)=>{
    console.log(rs)
})
//Insert data cho table user
conn.query('insert into user(fullname,gender,age)'+
            'values(?,?,?),(?,?,?)',[user1.fullname,user1.gender,user1.age,user2.fullname,
            user2.gender,user2.age],(err, rs)=>{
                console.log(err)
                console.log(rs)
})