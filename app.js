const app=require('express')();
require('dotenv').config();
app.use((req,res,next)=>{
    res.send('HELLO');
});
app.listen(process.env.PORT,()=>{
    console.log(`listening at http://localhost:${process.env.PORT}`);
});