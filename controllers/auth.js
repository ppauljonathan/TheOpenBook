const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');

const User=require('../models/user');

module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login'
    })
}

module.exports.postLogin=(req,res,next)=>{
    res.redirect('/');
}

module.exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Signup',
        errors:[]
    })
}

module.exports.postSignup=(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.render('auth/signup',{
            title:'Signup',
            errors:errors.array({onlyFirstError:true})
        })
    }
    const email=req.body.email;
    const username=req.body.username;
    const password=req.body.password;
    bcrypt
    .hash(password,12)
    .then(hashedpwd=>{
        const user=new User({
            email:email,
            username:username,
            password:hashedpwd
        });
        return user.save();
    })
    .then(d=>{
        res.redirect('/login');
    })
    .catch(err=>{
        next(err);
    })
}