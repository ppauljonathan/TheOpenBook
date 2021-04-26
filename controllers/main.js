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
        res.render('client/index',
        {
            title:'TheOpenBook',
            posts:data,
            currPage:pageNo,
            firstPage:1,
            lastPage:totalPage,
            isLoggedIn:req.session.isLoggedIn
        })
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.getCreate=(req,res,next)=>{
    res.render('client/create',{
        title:'New Post',
        isLoggedIn:req.session.isLoggedIn
    })
}

module.exports.postCreate=(req,res,next)=>{
    const post={
        heading:req.body.heading,
        content:req.body.content,
        creator:req.session.user,
    }
    let postId;
    Post.create(post)
    .then(post=>{
        postId=post._id;
        return User
        .findById(req.session.user);
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
    .populate('creator')
    .then(post=>{
        res.render('client/singlePost',{
            title:'Reading Mode',
            post:post,
            isLoggedIn:req.session.isLoggedIn,
            user:req.session.user
        })
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.getProfile=(req,res,next)=>{
    User
    .findById(req.session.user)
    .populate('posts')
    .then(user=>{
        return res.render('client/profile',{
            title:'Profile',
            isLoggedIn:req.session.isLoggedIn,
            user:user
        })
    })
    .catch(err=>{
        next(err)
    })
}

module.exports.getEditPost=(req,res,next)=>{
    Post
    .findById(req.params.postId)
    .then(oldpost=>{
        res.render('client/create',{
            title:'Edit Mode',
            isLoggedIn:req.session.isLoggedIn,
            oldpost:oldpost
        })
    })
    .catch();
}

module.exports.postEditPost=(req,res,next)=>{
    Post
    .findById(req.params.postId)
    .then(post=>{
        post.heading=req.body.heading;
        post.content=req.body.content;
        return post.save();
    })
    .then(saved=>{
        res.redirect('/');
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.postDeletePost=(req,res,next)=>{
    const postId=req.params.postId;
    Post
    .findByIdAndDelete(postId)
    .then(post=>{
        return User
        .findById(post.creator.toString());
    })
    .then(user=>{
        for(let i=0;i<user.posts.length;i++){
            if(user.posts[i].toString()===postId.toString()){
                user.posts.splice(i,1);
                break;
            }
        }
        return user.save();
    })
    .then(savedUser=>{
        res.redirect('/');
    })
    .catch(err=>{
        next(err);
    })
}