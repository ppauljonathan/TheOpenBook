const User=require('../models/user');

module.exports.isConf=(req,res,next)=>{
    const id=req.session.user;
    User
    .findById(id)
    .then(user=>{
        if(!user.isConfirmed){
            return user.delete();
        }
        else{
            next();
        }
    })
    .then(del=>{
        if(typeof del!=='undefined'){
            res.redirect('/signup');
        }
    })
    .catch(err=>{
        next(err);
    })
}