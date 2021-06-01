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
        secure_url:{    
            type:String,
            required:true,
            default:'/DEFAULT.jpg'
        },
        public_id:{
            type:String,
            required:true,
            default:'notnamed'
        }
    },
    expires:{
        type:Date
    },
    comments:[{
        poster:String,
        content:String
    }]
});

module.exports=mongoose.model('Post',postSchema);