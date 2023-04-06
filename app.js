const express = require('express')
const app = express()
const useRouter = require('./router/useRouter')
const port = 3000



app.use('/user',useRouter)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })


