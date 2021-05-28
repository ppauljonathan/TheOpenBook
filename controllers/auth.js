const crypto=require('crypto');

const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
require('dotenv').config();
const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User=require('../models/user');

const {checkEmailAndUsername}=require('../util/CEAU');
const {otpGen}=require('../util/OTP');
const { type } = require('os');

module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login',
        errors:[],
        isLoggedIn:req.session.isLoggedIn||false,
        csrfToken:req.csrfToken()
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
                errors:[{msg:'E-mail Or Username Incorrect Or Your Account May Have Been Deleted Due To Inactivity'}],
                isLoggedIn:req.session.isLoggedIn||false,
                csrfToken:req.csrfToken()
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
                    isLoggedIn:req.session.isLoggedIn||false,
                    csrfToken:req.csrfToken()
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
        isLoggedIn:req.session.isLoggedIn||false,
        csrfToken:req.csrfToken()
    })
}

module.exports.postSignup=(req,res,next)=>{
    const otp=otpGen();
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.render('auth/signup',{
            title:'Signup',
            errors:errors.array({onlyFirstError:true}),
            isLoggedIn:req.session.isLoggedIn||false,
            csrfToken:req.csrfToken()
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
                isLoggedIn:req.session.isLoggedIn||false,
                csrfToken:req.csrfToken()
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
                    isLoggedIn:req.session.isLoggedIn||false,
                    csrfToken:req.csrfToken()
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
                password:hashedpwd,
                isConfirmed:false,
                OTP:otp
            });
        }
    })
    .then(d=>{
        if(typeof d!=='undefined'){
            sgMail.send({
                to:email,
                from:'nodejsappdevops@gmail.com',
                subject:'verify your email',
                html:`
                    <p>Please enter this OTP <br>${otp}<br>on the prompt to verify your email</p>
                `
            })
            .then(()=>{console.log("sent to "+email);})
            .catch(err=>{console.log(err);})
            res.redirect('/otp');
        }
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getReset=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Reset Password',
        errors:[],
        isLoggedIn:req.isLoggedIn,
        csrfToken:req.csrfToken(),
        resetToken:req.params.token,
    });
}

module.exports.postReset=(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.render('auth/signup',{
            title:'Reset Password',
            errors:errors.array({onlyFirstError:true}),
            isLoggedIn:req.session.isLoggedIn||false,
            csrfToken:req.csrfToken(),
            resetToken:req.params.token
        })
    }
    let user;
    checkEmailAndUsername(req.body.emailOrUsername)
    .then(data=>{
        if(data==='unsuccessful'){
            return res.render('auth/signup',{
                title:'Reset Password',
                errors:[{msg:'E-mail Or Username Incorrect Or Your Account May Have Been Deleted Due To Inactivity'}],
                isLoggedIn:req.session.isLoggedIn||false,
                csrfToken:req.csrfToken(),
                resetToken:req.params.token
            })
        }
        else{
            user=data[0];
            if(user.resetToken!==req.params.token){
                return res.render('auth/signup',{
                    title:'Reset Password',
                    errors:[{msg:'Reset Token Incorrect'}],
                    isLoggedIn:req.session.isLoggedIn||false,
                    csrfToken:req.csrfToken(),
                    resetToken:req.params.token
                })
            }
            if(user.resetExp<Date.now()){
                return res.render('auth/signup',{
                    title:'Reset Password',
                    errors:[{msg:'Reset Token Expired Please Initiate Reset Request Again'}],
                    isLoggedIn:req.session.isLoggedIn||false,
                    csrfToken:req.csrfToken(),
                    resetToken:req.params.token
                })
            }
            return bcrypt
            .hash(req.body.password,12)
        }
    })
    .then(hashedpwd=>{
        if(typeof hashedpwd!=='undefined'){
            user.password=hashedpwd;
            return user.save();
        }
    })
    .then(savedUser=>{
        if(typeof savedUser!=='undefined')
        {
            res.redirect('/login');
        }
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getOTP=(req,res,next)=>{
    res.render('auth/otp',{
        title:'OTP',
        isLoggedIn:req.session.isLoggedIn||false,
        csrfToken:req.csrfToken(),
        errors:[]
    })
}

module.exports.postOTP=(req,res,next)=>{
    const otp=req.body.otp;
    User
    .findOne({OTP:otp})
    .then(user=>{
        if(typeof user==='undefined'||!user){
            return res.render('auth/otp',{
                title:'OTP',
                isLoggedIn:req.session.isLoggedIn||false,
                csrfToken:req.csrfToken(),
                errors:[{msg:'Please Enter The Correct 6-digit OTP'}]
            })
        }
        if(!user.isConfirmed){
            user.isConfirmed=true;
            user.OTP=-9919;
        }
        return user.save();
    })
    .then(saved=>{
        if(typeof saved!=='undefined')
        {
            res.redirect('/login');
        }
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getReseter=(req,res,next)=>{
    res.render('auth/reseter',{
        title:'Token',
        isLoggedIn:req.session.isLoggedIn||false,
        csrfToken:req.csrfToken(),
        errors:[]      
    })
}

module.exports.postReseter=(req,res,next)=>{
    checkEmailAndUsername(req.body.otp)
    .then(user=>{
        if(user==='unsuccessful'){
            return res.render('auth/reseter',{
                title:'Token',
                isLoggedIn:req.session.isLoggedIn||false,
                csrfToken:req.csrfToken(),
                errors:[{msg:'E-mail Or Username Incorrect Or Your Account May Have Been Deleted Due To Inactivity'}]
            })
        }
        else{
            const token=crypto.randomBytes(32).toString('hex');
            user[0].resetToken=token;
            user[0].resetExp=Date.now()+3600000;
            return user[0].save();
        }
    })
    .then(saved=>{
        if(typeof saved!=='undefined'){
            res.render('auth/reseter',{
                title:'Token',
                isLoggedIn:req.session.isLoggedIn||false,
                csrfToken:req.csrfToken(),
                errors:[{msg:'A Reset Link Has Been Sent To Your Email'}]
            })
            sgMail.send({
                to:saved.email,
                from:'nodejsappdevops@gmail.com',
                subject:'Password Reset',
                html:`
                    <h2>You have requested a password request please <a href="${process.env.WEBSITE_ROOT}/reset-pwd/${saved.resetToken}">click here </a>to go to the reset link</h2>
                    <p>this link is only active for 60 minutes</p>
                `
            })
            .then(()=>{console.log("sent to "+saved.email);})
            .catch(err=>{console.log(err);})
        }
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.postDeleteUser=(req,res,next)=>{
    if(req.session.user.toString()!==req.params.id.toString()){
        return res.redirect('/');
    }
    User.findByIdAndDelete(req.params.id)
    .then(done=>{
        res.redirect('/login');
    })
    .catch(err=>{
        next(err);
    })
}