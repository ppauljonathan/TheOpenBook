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
        req.session.isLoggedIn=false;
    }
    next();
}