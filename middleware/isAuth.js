const User=require('../models/user');

module.exports.isAuth=(req,res,next)=>{
    if(typeof req.session.isLoggedIn==='undefined'||!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    else{
        next();
    }
}

module.exports.remAuth=(req,res,next)=>{
    if(req.session.isLoggedIn===true){
        User.findById(req.session.user.toString())
        .then(user=>{
            if(user==null){return;}
            user.lastSeen=Date.now()+1000*60*60*24*7*4;
            return user.save();
        })
        .then(saved=>{
            req.session.isLoggedIn=false;
            next();
        })
        .catch(err=>{
            next(err);
        })
    }
    else{
        next();
    }
}