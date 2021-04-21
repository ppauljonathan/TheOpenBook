const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const sessionSchema=new Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    expires:Date,
},
{
    timestamps:true
});

module.exports=mongoose.model('Session',sessionSchema);