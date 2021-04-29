const User=require('../models/user');

module.exports.checkEmailAndUsername=(value)=>{
    return new Promise((resolve,reject)=>{
        User
        .find({email:value})
        .then(user=>{
            if(user.length!=0){
                resolve(user);
            }
            else{
                return false;
            }
        })
        .then(fal=>{
            if(!fal){
                return User
                .find({username:value});
            }
        })
        .then(user=>{
            if(user.length!=0){
                resolve(user);
            }
            else{
                return false;
            }
        })
        .then(fal=>{
            if(!fal){
                resolve('unsuccessful')
            }
        })
        .catch(err=>{
            reject(err);
        })
    });
}