const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    posts:[{
        type:mongoose.Types.ObjectId,
        ref:'Post'
    }],
    isConfirmed:Boolean,
    OTP:Number,
    resetToken:String,
    resetExp:{
        type:Date
    }
});

module.exports=mongoose.model('User',userSchema);