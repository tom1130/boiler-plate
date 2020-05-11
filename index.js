const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { User } = require('./models/User')
const config = require('./config/key')


app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json()); 

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,
{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
).then(()=> console.log('MongoDB connected...')
).catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))


app.post('/register',(req, res) =>{
    // 회원 가입 시 정보들 client에서 가져오면 그것들을 데이터 베이스에 넣어줌
    const user = new User(req.body)
    user.save((err,userInfo)=>{
        if(err) return res.json({ success:false, err})
        return res.status(200).json({
            success:true
        })
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))