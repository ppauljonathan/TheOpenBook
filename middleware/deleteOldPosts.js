const Post=require('../models/post');
const User=require('../models/user');

const {deletePostImage}=require('../util/DPI');

module.exports.deleteOldPosts=(req,res,next)=>{
    Post
    .find({expires:{$lte:Date.now()}})
    .then(posts=>{
        if(posts.length===0){next();}
        for(let i=0;i<posts.length;i++){
            User
            .findById(posts[i].creator)
            .then(user=>{
                for(let j=0;j<user.posts.length;j++){
                    if(user.posts[i].toString()===posts[i]._id.toString())
                    {
                        user.posts.splice(j,1);
                        break;
                    }
                }
                return user.save();
            })
            .then(user=>{
                return deletePostImage(posts[i].imageUrl.public_id);
            })
            .then(dele=>{
                return posts[i].deleteOne();
            })
            .then(del=>{
                console.log('deleted');
                next();
            })
            .catch(err=>{
                next(err);
            })
        }
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.deleteOldUsers=(req,res,next)=>{
    User.find({lastSeen:{$lte:Date.now()}})
    .then(user=>{
        if(user.length==0){
            next();
        }
        else{
            for(let i=0;i<user.length;i++){
                user[i].delete()
                .then(del=>{
                    console.log('deleted');
                    next();
                })
                .catch(err=>{
                    next(err);
                })
            }
        }
    })
    .catch(err=>{
        console.log(err);
    })
}