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
    .populate('favorites')
    .then(user=>{
        if(req.url==='/profile'){
            return res.render('main/profile',{
                title:'Profile',
                isLoggedIn:req.isLoggedIn,
                user:user
            });
        }
        else if(req.url==='/favorites'){
            return res.render('main/profile',{
                title:'Favorites',
                isLoggedIn:req.isLoggedIn,
                user:user
            });
        }
    })
    .catch(err=>{
        next(err)
    })
}

module.exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId;  
    const userId=req.userId
    Post
    .findByIdAndDelete(postId)
    .then(post=>{
        return User
        .findById(userId.toString());
    })
    .then(user=>{
        for(let i=0;i<user.posts.length;i++){
            if(user.posts[i]==postId){
                user.posts.splice(i,1);
                break;
            }
        }
        for(let i=0;i<user.favorites.length;i++){
            if(user.favorites[i]==postId){
                user.favorites.splice(i,1);
                break;
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

module.exports.upvotePost=(req,res,next)=>{
    const userId=req.userId;
    const postId=req.params.postId;
    let flag=-1;
    Post
    .findById(postId)
    .then(post=>{
        for(let i=0;i<post.upvoters.length;i++){
            if(post.upvoters[i].toString()===userId.toString()){
                flag=i;
                break;
            }
        }
        for(let i=0;i<post.downvoters.length;i++){
            if(post.downvoters[i].toString()===userId.toString()){
                post.downvoters.splice(i,1);
                break;
            }
        }
        if(flag==-1){
            post.upvoters.push(userId);
        }
        else{
            post.upvoters.splice(flag,1);
        }
        return post.save();
    })
    .then(savedPost=>{
        return User
        .findById(userId);
    })
    .then(user=>{
        if(flag==-1){
            user.favorites.push(postId);
        }
        else{
            for(let i=0;i<user.favorites.length;i++){
                if(user.favorites[i].toString()===postId.toString()){
                    user.favorites.splice(i,1);
                    break;
                }
            }
        }
        return user.save();
    })
    .then(savedUser=>{
        res.redirect(`/post/${postId}`);
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.downvotePost=(req,res,next)=>{
    const postId=req.params.postId;
    const userId=req.userId;
    let flag=-1;
    Post
    .findById(postId)
    .then(post=>{
        for(let i=0;i<post.downvoters.length;i++){
            if(post.downvoters[i].toString()===userId){
                flag=i;
                break;
            }
        }
        for(let i=0;i<post.upvoters.length;i++){
            if(post.upvoters[i].toString()===userId){
                post.upvoters.splice(i,1);
            }
        }
        if(flag==-1){
            post.downvoters.push(userId);
        }
        else{
            post.downvoters.splice(flag,1);
        }
        return post.save()
    })
    .then(savedPost=>{
        return User
        .findById(userId);
    })
    .then(user=>{
        for(let i=0;i<user.favorites.length;i++){
            if(user.favorites[i].toString()===postId){
                user.favorites.splice(i,1);
                break;
            }
        }
        return user.save()
    })
    .then(savedUser=>{
        res.redirect(`/post/${postId}`);
    })
    .catch(err=>{
        console.log(err);
    })
}