const Post=require('../models/post');
const User=require('../models/user');

const ITEMS_PER_PAGE=3;

module.exports.main=(req,res,next)=>{
    const pageNo=req.query.page||1;
    let totalPage;
    Post.countDocuments()
    .then(num=>{
        totalPage=Math.ceil(num/ITEMS_PER_PAGE);
        return Post
        .find()
        .sort({_id:-1})
        .skip((pageNo-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(data=>{
        res.render('client/index',
        {
            title:'TheOpenBook',
            posts:data,
            currPage:pageNo,
            firstPage:1,
            lastPage:totalPage
        })
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.getCreate=(req,res,next)=>{
    res.render('client/create',{
        title:'New Post'
    })
}

module.exports.postCreate=(req,res,next)=>{
    const post={
        heading:req.body.heading,
        content:req.body.content,
        creator:req.session.userId
    }
    let postId;
    Post.create(post)
    .then(post=>{
        postId=post._id;
        return User
        .findById(post.creator);
    })
    .then(user=>{
        user.posts.push(postId);
        return user.save();
    })
    .then(result=>{
        res.redirect('/');
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getSinglePost=(req,res,next)=>{
    const postId=req.params.postId;
    Post
    .findById(postId)
    .then(post=>{
        res.render('client/singlePost',{
            title:'Reading Mode',
            post:post
        })
    })
    .catch(err=>{
        next(err);
    });
}