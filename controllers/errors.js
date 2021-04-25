module.exports.get404=(req,res,next)=>{
    res
    .status(404)
    .render('404',{
        title:'Page Not Found',
        isLoggedIn:req.session.isLoggedIn
    })
}

module.exports.get500=(err,req,res,next)=>{
    res
    .status(500)
    .render('500',{
        title:'Server Error',
        message:err,
        isLoggedIn:req.session.isLoggedIn
    })
}