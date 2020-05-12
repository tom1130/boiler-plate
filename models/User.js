const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name :{
        type: String,
        maxlength: 50
    },
    email :{
        type: String,
        trim: true,
        unique: true,
    },
    password:{
        type: String,
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save',function( next ){
    //비밀번호 암호화 시킴
    const user = this;
    if(user.isModified('password')){

        bcrypt.genSalt(saltRounds, function(err,salt){
            if (err) return next(err);

            bcrypt.hash(user.password,salt,function(err, hash) {
                if(err) return next(err);
                user.password = hash;
                next()
            });
        })
    }else{
        next();
    }

})//user model에 user 정보를 저장하기 전에 

userSchema.methods.comparePassWord = function(plainPassword, cb){

    bcrypt.compare(plainPassword,this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;

    var token = jwt.sign(user._id.toHexString(),'secretToken')
    user.token = token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })
}


const User = mongoose.model('User',userSchema)

module.exports = { User }