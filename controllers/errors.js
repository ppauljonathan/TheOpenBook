module.exports.get404=(req,res,next)=>{
    res.status(404);
    res.render('404',{
        title:'Page Not Found'
    })
}

module.exports.get500=(err,req,res,next)=>{
    res.status(500);
    res.render('500',{
        message:err
    })
}