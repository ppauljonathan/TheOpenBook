let status=false;
const nav=document.querySelector(".nav");
const hamb=document.querySelector(".one");
function navOp(){
    if(status==false){
        status=true;
        nav.style.width='100vw';
        hamb.innerHTML="&cross;";
    }
    else{
        status=false
        nav.style.width='0vw';
        hamb.innerHTML="&equiv;";
    }
}