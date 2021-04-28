const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const postSchema=new Schema({
    heading:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    creator:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    upvoters:[{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }],
    downvoters:[{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }],
    imageUrl:{
        type:String,
        required:true,
        default:'/images/DEFAULT.jpg'
    }
});

module.exports=mongoose.model('Post',postSchema);