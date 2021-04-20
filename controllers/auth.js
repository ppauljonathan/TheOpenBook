const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');

const User=require('../models/user');

module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login',
        errors:[]
    })
}

module.exports.postLogin=(req,res,next)=>{
    const emailOrUsername=req.body.emailOrUsername;
    const password=req.body.password;
    let query;
    User
    .find({email:emailOrUsername})
    .then(data=>{
        if(data.length==0){
            return User
            .find({username:emailOrUsername});
        }
        else{
            query=data;
            return true;
        }
    })
    .then(tmodel=>{
        if(tmodel.length==0){
            return res
            .render('auth/login',{
                title:'Login',
                errors:[{msg:'email/username incorrect'}]
            })
        }
        else{
            if(tmodel==true){return tmodel;}
            else{
                query=tmodel;
                return true;
            }
        }
    })
    .then(dat=>{
        if(dat==true){
            return bcrypt
            .compare(password,query[0].password);
        }
        else{
            return false;
        }
    })
    .then(result=>{
        if(result==true){
            return res.redirect('/');
        }
        else{
            return res
            .render('auth/login',{
                title:'Login',
                errors:[{msg:'Password Incorrect'}]
            })
        }
    })
    //res.redirect('/login')
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
    User
    .find({email:email})
    .then(dat=>{
        if(dat.length!=0){
            return res.render('auth/signup',{
                title:'Signup',
                errors:[{msg:'email already in use'}]
            })
        }
        return User
        .find({username:username});
    })
    .then(dat=>{
        if(dat.length!=0){
            return res.render('auth/signup',{
                title:'Signup',
                errors:[{msg:'username already in use'}]
            })
        }
        return bcrypt
        .hash(password,12)
    })
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