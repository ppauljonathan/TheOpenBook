const express=require('express');
const app=express();
const dotenv=require('dotenv');
dotenv.config();
const mongoose=require('mongoose');
const session=require('express-session');
const MongoStore=require('connect-mongodb-session')(session);


const routes=require('./routes/routes');
const authRoutes=require('./routes/auth');
const errorHandlers=require('./controllers/errors');

const MONGO_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@theopenbook.q3gox.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const store=new MongoStore({
    uri:MONGO_URI,
    collection:'sessions'
})

app.use(session({
    secret:'mysupersupersecretsecret',
    resave:false,
    cookie:{
        maxAge:1000*60*45
    },
    saveUninitialized:true,
    store:store
}))

app.use(express.urlencoded({extended:true}));

app.use((req,res,next)=>{
    const user={
        id:9919103121,
        userName:'P Paul Jonathan',
        email:'test@test.com',
        password:'wefrwedf'
    }
    req.user=user;
    next();
});

app.use(express.static('public'));

app.set('view engine','ejs');

app.set('views','./views');

app.use(routes);
app.use(authRoutes);

app.use(errorHandlers.get404);

app.use(errorHandlers.get500);

mongoose.connect(
    MONGO_URI,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
);

app.listen(process.env.PORT||3000,()=>{
    console.log(`listening at http://localhost:${process.env.PORT||3000}`);
});