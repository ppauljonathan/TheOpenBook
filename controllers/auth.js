module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login'
    })
}

module.exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Signup'
    })
}