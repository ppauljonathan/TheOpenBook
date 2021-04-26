const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const postSchema=new Schema(
    {
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
        }
    },
    {
        timestamps:true
    }
);

module.exports=mongoose.model('Post',postSchema);