const mongoose=require('mongoose');

const Session=require('../models/session');

module.exports.isAuth=(req,res,next)=>{
    if(!req.headers.cookie){return res.redirect('/login');}
    next();
}

module.exports.clearSessions=(req,res,next)=>{
    Session
    .find()
    .then(sessions=>{
        sessions.forEach(session => {
            if(session.expires<Date.now()){
                res.clearCookie("session");
                req.isLoggedIn=false;
                return session.delete()
                .then(del=>{
                    res.redirect('/login');
                });
            }
        });
        next();
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.assignUser=(req,res,next)=>{
    if(!req.headers.cookie){next();}
    else if(!mongoose.isValidObjectId(req.headers.cookie.split('=')[1])){
        res
        .clearCookie("session")
        .redirect('/login');
    }
    else{
        Session
        .findById(req.headers.cookie.split('=')[1])
        .then(session=>{
            console.log(session);
            // if(!session.user){
            //     return res.clearCookie("session");
            // }
            // req.isLoggedIn=true;
            // req.userId=session.user.toString();
            next();
        })
        .catch(err=>{
            next(err);
        });
    }
}