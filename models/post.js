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
        id:{
            type:Number,
            required:true,
        },
        name:{
            type:String,
            required:true
        },
    }
});

module.exports=mongoose.model('Post',postSchema);