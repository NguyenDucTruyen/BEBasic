const express = require('express')
const cors = require('cors');
const app = express()

const authRoute = require('./router/auth')
const userRoute = require('./router/user');
const pollRoute = require('./router/poll')
var bodyParser = require('body-parser') 
app.use(bodyParser.urlencoded({ extended: false })) 		// parse application/x-www-form-urlencoded
app.use(bodyParser.json())	                            // parse application/json

/* khi app.use tức là các route chứa trong app đều có thể sử dụng body-parse
  nếu sử dụng:
    useRouter.use(bodyParser.urlencoded({ extended: false })) 		// parse application/x-www-form-urlencoded
    useRouter.use(bodyParser.json())	 
    => thì chỉ có route useRouter sử dụng được body-parser, nếu sau này có thêm các route khác
    thì các route đó k thể sử dụng body-parser và nếu muốn dùng thì sẽ phải khai báo lại riêng cho các route đó
    ---> dùng app.use(......) để tất cả route đều có thể sử dụng
*/
app.use(cors());
app.use('/auth',authRoute)
app.use('/users',userRoute)
app.use('/poll',pollRoute)


app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
  })


