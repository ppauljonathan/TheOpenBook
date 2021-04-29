const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');

const User=require('../models/user');

const {checkEmailAndUsername}=require('../util/CEAU');

module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login',
        errors:[],
        isLoggedIn:req.session.isLoggedIn
    })
}

module.exports.postLogin=(req,res,next)=>{
    const value=req.body.emailOrUsername;
    const password=req.body.password;
    let user;
    checkEmailAndUsername(value)
    .then(data=>{
        if(data==='unsuccessful'){
            return res.render('auth/login',{
                title:'Login',
                errors:[{msg:'E-mail Or Username Incorrect'}],
                isLoggedIn:req.session.isLoggedIn
            })
        }
        else{
            user=data[0];
            return bcrypt
            .compare(password,data[0].password);
        }
    })
    .then(datas=>{
        if(typeof datas!=='undefined'){
            if(datas===true){
                req.session.user=user._id;
                req.session.isLoggedIn=true;
                res.redirect('/');
            }
            else{
                res.render('auth/login',{
                    title:'Login',
                    errors:[{msg:'Password Incorrect'}],
                    isLoggedIn:req.session.isLoggedIn
                });
            }
        }
    })
    .catch(err=>{console.log(err);});
}

module.exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Signup',
        errors:[],
        isLoggedIn:req.session.isLoggedIn
    })
}

module.exports.postSignup=(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.render('auth/signup',{
            title:'Signup',
            errors:errors.array({onlyFirstError:true}),
            isLoggedIn:req.session.isLoggedIn
        })
    }
    const email=req.body.email;
    const username=req.body.username;
    const password=req.body.password;
    User
    .find({email:email})
    .then(dat=>{
        if(dat.length!=0){
            return res.render('auth/signup',{
                title:'Signup',
                errors:[{msg:'email already in use'}],
                isLoggedIn:req.session.isLoggedIn
            })
        }
        return User
        .find({username:username});
    })
    .then(dat=>{
        if(typeof dat!=='undefined'){
            if(dat.length!=0){
                return res.render('auth/signup',{
                    title:'Signup',
                    errors:[{msg:'username already in use'}],
                    isLoggedIn:req.session.isLoggedIn
                })
            }
            return bcrypt
            .hash(password,12)
        }
    })
    .then(hashedpwd=>{
        if(typeof hashedpwd!=='undefined'){
            return User
            .create({
                email:email,
                username:username,
                password:hashedpwd
            });
        }
    })
    .then(d=>{
        if(typeof d!=='undefined'){
            res.redirect('/login');
        }
    })
    .catch(err=>{
        next(err);
    })
}