module.exports.getLogin=(req,res,next)=>{
    res.render('auth/login',{
        title:'Login'
    })
}

module.exports.postLogin=(req,res,next)=>{
    console.log(req.body);
    res.redirect('/');
}

module.exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{
        title:'Signup'
    })
}

module.exports.postSignup=(req,res,next)=>{
    console.log(req.body);
    res.redirect('/login');
}