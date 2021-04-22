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
        .populate('creator')
        .sort({_id:-1})
        .skip((pageNo-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(data=>{
        res.render('main/index',
        {
            title:'TheOpenBook',
            posts:data,
            currPage:pageNo,
            firstPage:1,
            lastPage:totalPage,
            isLoggedIn:req.isLoggedIn
        })
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.getCreate=(req,res,next)=>{
    res.render('main/create',{
        title:'New Post',
        isLoggedIn:req.isLoggedIn
    })
}

module.exports.postCreate=(req,res,next)=>{
    const post={
        heading:req.body.heading,
        content:req.body.content
    }

    let creator;
    User
    .findById(req.userId)
    .then(user=>{
        post.creator=user;
        creator=user;
        return Post
        .create(post)
    })
    .then(result=>{
        creator.posts.push(result);
        return creator.save();
    })
    .then(udata=>{
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
        res.render('main/singlePost',{
            title:'Reading Mode',
            post:post,
            isLoggedIn:req.isLoggedIn,
            userId:req.userId
        })
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.getProfile=(req,res,next)=>{
    User
    .findById(req.userId)
    .populate('posts')
    .then(user=>{
        return res.render('main/profile',{
            title:'Profile',
            isLoggedIn:req.isLoggedIn,
            user:user
        })
    })
    .catch(err=>{
        next(err)
    })
}

module.exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;  
    Post
    .findByIdAndDelete(postId)
    .then(post=>{
        return User
        .findById(post.creator.toString());
    })
    .then(user=>{
        for(let i=0;i<user.posts.length;i++){
            if(user.posts[i]==postId){
                user.posts.splice(i,1);
            }
        }
        return user.save();
    })
    .then(data=>{
        res.redirect('/');
    })
    .catch(err=>{
        next(err);
    }); 
}