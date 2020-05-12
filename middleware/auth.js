const { User } = require('../models/User')

let auth = (req,res,next)=>{
    // 인증 처리를 하는 곳 
    // 클라이언트 쿠키에서 토큰을 가지고 옴
    // 이후 복호화 -> user를 찾는다
    // user가 있는지 확인!!
    let token = req.cookies.x_auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false,err:true})

        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = {auth}