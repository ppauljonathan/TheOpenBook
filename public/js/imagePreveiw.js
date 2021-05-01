const image=document.querySelector(".preveiw");
const file=document.querySelector(".image");

file.onchange=function(){
    const reader=new FileReader();
    reader.onload=function(e){
        image.src=e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
}