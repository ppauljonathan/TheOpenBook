const deleteAccount=()=>{
    const sure=document.getElementById("sure");
    sure.value='true';
    if(!confirm('this will NOT delete all your posts'))
    {
        sure.value='false';
        return;
    }
}