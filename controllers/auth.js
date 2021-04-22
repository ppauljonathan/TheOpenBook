const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');

const User=require('../models/user');
const Session=require('../models/session');

module.exports.getLogin=(req,res,next)=>{
    if(req.headers.cookie){
        Session
        .findByIdAndDelete(req.headers.cookie.split('=')[1])
        .then(result=>{
            res
            .clearCookie("session")
            .render('auth/login',{
                title:'Login',
                errors:[],
                isLoggedIn:req.isLoggedIn
            })
        })
        .catch(err=>{
            next(err);
        })
    }
    else{
        res
        .clearCookie("session")
        .render('auth/login',{
            title:'Login',
            errors:[],
            isLoggedIn:req.isLoggedIn
        })
    }
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
                errors:[{msg:'email/username incorrect'}],
                isLoggedIn:req.isLoggedIn
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
            const oldDate=new Date();
            // const nextday=new Date(oldDate.getFullYear(),oldDate.getMonth(),oldDate.getDate()+1);
            const nextday=new Date(oldDate.getTime()+45*60000)
            const session={
                user:query[0],
                expires:nextday
            }
            return Session
            .create(session);
        }
        else{
            return res
            .render('auth/login',{
                title:'Login',
                errors:[{msg:'Password Incorrect'}],
                isLoggedIn:req.isLoggedIn
            })
        }
    })
    .then(sess=>{
        req.isLoggedIn=true;
        req.userId=query[0]._id.toString();
        res
        .cookie("session",sess._id.toString())
        .redirect('/');
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Signup',
        errors:[],
        isLoggedIn:req.isLoggedIn
    })
}

module.exports.postSignup=(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.render('auth/signup',{
            title:'Signup',
            errors:errors.array({onlyFirstError:true}),
            isLoggedIn:req.isLoggedIn
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
                isLoggedIn:req.isLoggedIn
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