const {unlink}=require('fs');
const {join}=require('path');

module.exports.deletePostImage=(url)=>{
    return new Promise((resolve,reject)=>{
        const a=url.split('/')
        a.shift();
        if(a[a.length-1]==='DEFAULT.jpg'){return resolve('default image no delete')}
        const path=join(__dirname,'../','public',...a);
        unlink(path,(err)=>{
            if(err){return reject(err);}
            resolve('deleted');
        })
    })
}