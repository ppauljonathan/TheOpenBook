module.exports.get404=(req,res,next)=>{
    res.status(404);
    res.render('404',{
        title:'Page Not Found'
    })
}

module.exports.get500=(err,req,res,next)=>{
    res.status(500);
    console.log(err);
    res.render('500',{
        title:'Server Error',
        message:err
    })
}