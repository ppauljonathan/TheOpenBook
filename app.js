const express=require('express');
const app=express();
require('dotenv').config();

const routes=require('./routes/routes');
const e404=require('./controllers/404');


app.use(express.static('public'));

app.set('view engine','ejs');

app.set('views','./views');

app.use(routes);

app.use(e404.get404);

app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500);
    res.send('internal server error');
})

app.listen(process.env.PORT,()=>{
    console.log(`listening at http://localhost:${process.env.PORT}`);
});