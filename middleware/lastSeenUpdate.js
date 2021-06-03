const User=require('../models/user');

module.exports.lastSeenUpdate=(req,res,next)=>{
    if(
        typeof req.session!=='undefined'&&
        typeof req.session.user!='undefined'&&
        req.session.isLoggedIn===true
    ){
        User
        .findById(req.session.user)
        .then(user=>{
            if(user==null){
                return null;
            }
            else{
                user.lastSeen=Date.now()+1000*60*60*24*7*4;
                return user.save();
            }
        })
        .then(done=>{
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