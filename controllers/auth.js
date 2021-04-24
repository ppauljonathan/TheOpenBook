const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');

const User=require('../models/user');

function checkEmailAndUsername(value){
    return new Promise((resolve,reject)=>{
        User
        .find({email:value})
        .then(user=>{
            if(user.length!=0){
                resolve(user);
            }
            else{
                return false;
            }
        })
        .then(fal=>{
            if(!fal){
                return User
                .find({username:value});
            }
        })
        .then(user=>{
            if(user.length!=0){
                resolve(user);
            }
            else{
                return false;
            }
        })
        .then(fal=>{
            if(!fal){
                resolve('unsuccessful')
            }
        })
        .catch(err=>{
            reject(err);
        })
    });
}

module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login',
        errors:[]
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
                errors:[{msg:'E-mail Or Username Incorrect'}]
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
                req.session.userId=user._id;
                res.redirect('/');
            }
            else{
                res.render('auth/login',{
                    title:'Login',
                    errors:[{msg:'Password Incorrect'}]
                });
            }
        }
    })
    .catch(err=>{console.log(err);});
}

module.exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Signup',
        errors:[]
    })
}

module.exports.postSignup=(req,res,next)=>{
    const errors=validationResult(req);
    if(errors.array().length>0){
        return res.render('auth/signup',{
            title:'Signup',
            errors:errors.array()
        })
    }
    const user={
        username:req.body.username,
        email:req.body.email
    };
    bcrypt
    .hash(req.body.password,10)
    .then(hashedpwd=>{
        user.password=hashedpwd;
        return User.create(user);
    })
    .then(saveduser=>{
        res.redirect('/login');
    })
    .catch(err=>{
        next(err);
    })
}

