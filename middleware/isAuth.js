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
                return session.delete();
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
    else{
        Session
        .findById(req.headers.cookie.split('=')[1])
        .then(session=>{
            req.isLoggedIn=true;
            req.userId=session.user.toString();
            next();
        })
        .catch(err=>{
            next(err);
        });
    }
}