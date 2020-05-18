const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const { User } = require('./models/User')
const config = require('./config/key')
const cookieParser = require('cookie-parser');
const {auth} = require('./middleware/auth')

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json()); 
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,
{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}
).then(()=> console.log('MongoDB connected...')
).catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/api/hello',(req,res)=>{
    res.send('안녕하세요~')
})

app.post('/api/users/register',(req, res) =>{
    // 회원 가입 시 정보들 client에서 가져오면 그것들을 데이터 베이스에 넣어줌
    const user = new User(req.body)

    user.save((err,userInfo)=>{
        if(err) return res.json({ success:false, err})
        return res.status(200).json({
            success:true
        })
    })
})

app.post('/api/users/login',(req,res)=>{
    //요청된 이메일을 데이터베이스에 있는지 찾는다
    //요청된 이메일이 있으면 비밀번호 확인
    //토큰 생성
    User.findOne({ email: req.body.email}, (err,user)=>{
        if(!user){
            return res.json({
                loginSuccess:false,
                message:'찾고자 하는 유저가 없습니다'
            })
        }
        console.log(user)
        user.comparePassWord(req.body.password, (err,isMatch)=>{
            if(!isMatch){
            return res.json({
                loginSuccess:false,
                message:'비밀번호가 틀렸습니다'
            })}
            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err)

                // 토큰을 저장한다.. to where? -> 쿠키, local storage
                res.cookie('x_auth',user.token).status(200).json({
                    loginSuccess:true,
                    userId:user._id
                })
            })
        })
    } )
});

app.get('/api/users/auth',auth,(req,res)=>{
    //이거 실행하면 미들웨어 통과했다는 의미 -> auth : true
    //어떤 페이지에서든 유저 정보를 활용가능
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0? false : true,
        isAuth: true,
        email : req.user.email,
        name : req.user.name,
        lastname: req.user.lastname,
        role : req.user.role,
        image : req.user.image
    })
});

//로그아웃

app.get('/api/users/logout',auth,(req,res)=>{

    User.findOneAndUpdate({_id:req.user._id},
        {token:''},
        (err,user)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success: true
            })
        })

})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))