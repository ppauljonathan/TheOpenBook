const express=require('express');
const app=express();
require('dotenv').config();

const routes=require('./routes/routes');
const errorHandlers=require('./controllers/errors');

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

app.set('view engine','ejs');

app.set('views','./views');

app.use(routes);

app.use(errorHandlers.get404);

app.use(errorHandlers.get500);

app.listen(process.env.PORT||3000,()=>{
    console.log(`listening at http://localhost:${process.env.PORT||3000}`);
});