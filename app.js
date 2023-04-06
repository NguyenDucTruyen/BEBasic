const express = require('express')
const app = express()
const router = require('./apiRouter')
const port = 3000



app.use('/user',router)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

