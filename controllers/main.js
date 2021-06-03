const {promises}=require('fs');

const Post=require('../models/post');
const User=require('../models/user');

const {deletePostImage}=require('../util/DPI');

const cloudinary=require('cloudinary').v2;
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    enhance_image_tag:true,
    static_file_support:true
})
const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
            isLoggedIn:req.session.isLoggedIn||false
        })
    })
    .catch(err=>{
        next(err);
    });
}

module.exports.getCreate=(req,res,next)=>{
    res.render('client/create',{
        title:'New Post',
        isLoggedIn:req.session.isLoggedIn||false,
        csrfToken:req.csrfToken()
    })
}

module.exports.postCreate=(req,res,next)=>{
    const post={
        heading:req.body.heading,
        content:req.body.content,
        creator:req.session.user,
        expires:Date.now()+1000*60*60*24*7,
        imageUrl:{}
    };
    let postId;
    if(typeof req.file!=='undefined'){
        cloudinary
        .uploader
        .upload(req.file.path)
        .then(result=>{
            post.imageUrl.secure_url=result.secure_url;
            post.imageUrl.public_id=result.public_id;
            return promises.unlink(req.file.path);
        })
        .then(dele=>{
            return Post.create(post)
        })
        .then(post=>{
            postId=post._id;
            return User
            .findById(req.session.user);
        })
        .then(user=>{
            user.posts.push(postId);
            return user.save();
        })
        .then(udata=>{
            res.redirect('/');
        })
        .catch(err=>{
            next(err);
        })
    }
    else{
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
        .then(udata=>{
            res.redirect('/');
        })
        .catch(err=>{
            next(err);
        })
    }
}

module.exports.getSinglePost=(req,res,next)=>{
    const postId=req.params.postId;
    let userToPost='none'
    Post
    .findById(postId)
    .populate('creator')
    .then(post=>{
        if(typeof req.session.user!=='undefined'){
            for(let i=0;i<post.upvoters.length;i++){
                if(post.upvoters[i].toString()===req.session.user.toString()){
                    userToPost='upvoter';
                }
            }
            for(let i=0;i<post.downvoters.length;i++){
                if(post.downvoters[i].toString()===req.session.user.toString()){
                    userToPost='downvoter';
                }
            }
        }
        res.render('client/singlePost',{
            title:'Reading Mode',
            post:post,
            isLoggedIn:req.session.isLoggedIn||false,
            user:req.session.user,
            userToPost:userToPost,
            url:req.url,
            csrfToken:req.csrfToken()
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
            isLoggedIn:req.session.isLoggedIn||false,
            user:user,
            csrfToken:req.csrfToken()
        })
    })
    .catch(err=>{
        next(err)
    })
}

module.exports.getEditPost=(req,res,next)=>{
    let op;
    Post
    .findById(req.params.postId)
    .then(oldpost=>{
        op=oldpost;
        return deletePostImage(op.imageUrl.public_id);
    })
    .then(dele=>{
        res.render('client/create',{
            title:'Edit Mode',
            isLoggedIn:req.session.isLoggedIn||false,
            oldpost:op,
            csrfToken:req.csrfToken()
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
        if(typeof req.file!=='undefined'){
            cloudinary
            .uploader
            .upload(req.file.path)
            .then(result=>{
                post.imageUrl.secure_url=result.secure_url;
                post.imageUrl.public_id=result.public_id;
                return post.save();
            })
        }
        else{
            post.imageUrl.secure_url='/DEFAULT.jpg';
            post.imageUrl.public_id='nonameyet';
            return post.save();
        }
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
    let cre;
    Post
    .findByIdAndDelete(postId)
    .then(post=>{
        cre=post.creator.toString();
        return deletePostImage(post.imageUrl.public_id);
    })
    .then(dele=>{
        return User
        .findById(cre);
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

module.exports.postUpvote=(req,res,next)=>{
    Post
    .findById(req.params.postId)
    .then(post=>{
        const index=post.upvoters.findIndex(user=>{
            return user.toString()===req.session.user.toString();
        });
        const bindex=post.downvoters.findIndex(user=>{
            return user.toString()===req.session.user.toString();
        });
        if(index===-1){
            if(bindex!==-1){
                post.downvoters.splice(bindex,1);
            }
            post.upvoters.push(req.session.user);
        }
        else{
            post.upvoters.splice(bindex,1);
        }
        return post.save();
    })
    .then(saved=>{
        res.redirect('/post/'+req.params.postId);
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.postDownvote=(req,res,next)=>{
    Post
    .findById(req.params.postId)
    .then(post=>{
        const index=post.downvoters.findIndex(user=>{
            return user.toString()===req.session.user.toString();
        });
        const bindex=post.upvoters.findIndex(user=>{
            return user.toString()===req.session.user.toString();
        });
        if(index===-1){
            if(bindex!==-1){
                post.upvoters.splice(bindex,1);
            }
            post.downvoters.push(req.session.user);
        }
        else{
            post.downvoters.splice(index,1);
        }
        return post.save()
    })
    .then(saved=>{
        res.redirect('/post/'+req.params.postId);
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getComments=(req,res,next)=>{
    let comments=[];
    Post.findById(req.params.postId)
    .then(post=>{
        comments.push(...post.comments);
        return User.findById(req.session.user)
    })
    .then(user=>{
        if(user===null){
            res.render('client/comments',{
                title:'Comments',
                isLoggedIn:req.session.isLoggedIn,
                user:false,
                comments:comments,
                action:req.url,
                csrfToken:req.csrfToken()
            })
        }  
        else{
            res.render('client/comments',{
                title:'Comments',
                isLoggedIn:req.session.isLoggedIn,
                user:user.username,
                comments:comments,
                action:req.url,
                csrfToken:req.csrfToken()
            })
        }
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.postComments=(req,res,next)=>{
    let poster;
    User.findById(req.session.user)
    .then(user=>{
        poster=user.username;
        return Post.findById(req.params.postId);
    })
    .then(post=>{
        const comment={
            content:req.body.comment,
            poster:poster
        }
        post.comments.unshift(comment);
        return post.save();
    })
    .then(saved=>{
        res.redirect(req.url);
    })
    .catch(err=>{
        next(err);
    })
}

module.exports.getEmail=(req,res,next)=>{
    res.render('client/issues',{
        title:'Bug Report or Feature Request',
        isLoggedIn:req.session.isLoggedIn,
        csrfToken:req.csrfToken()
    })
}

module.exports.postEmail=(req,res,next)=>{
    User
    .findById(req.session.user)
    .then(user=>{
        return sgMail.send({
            to:'nodejsappdevops@gmail.com',
            from:'nodejsappdevops@gmail.com',
            subject:'Issues',
            html:`
                <p>${req.body.issue}</p>
                <br>
                <p>-${user.username}</p>
            `
        })
    })
    .then(sent=>{
        res.redirect('/profile');
    })
    .catch(err=>{
        next(err);
    })
}