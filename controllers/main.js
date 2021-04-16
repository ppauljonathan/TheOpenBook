module.exports.main=(req,res,next)=>{
    res.render('index',{
        title:'TheOpenBook'
    });
}

module.exports.getCreate=(req,res,next)=>{
    res.render('create',{
        title:'New Post'
    })
}

module.exports.postCreate=(req,res,next)=>{
    console.log(req.body);
    res.redirect('/');
}