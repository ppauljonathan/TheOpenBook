const Post=require('../models/post');

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
    const post={
        heading:req.body.heading,
        content:req.body.content,
        creator:req.user
    }

    Post.create(post)
    .then(result=>{
        console.log(result);
        res.redirect('/');
    })
    .catch(err=>{
        next(err);
    })
}