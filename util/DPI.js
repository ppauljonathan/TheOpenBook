const {unlink}=require('fs');
const {join}=require('path');

const cloudinary=require('cloudinary').v2;
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    enhance_image_tag:true,
    static_file_support:false
})

module.exports.deletePostImage=(url)=>{
    return cloudinary
    .uploader
    .destroy(url);
}