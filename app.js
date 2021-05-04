const express=require('express');
const app=express();
const dotenv=require('dotenv');
dotenv.config();
const mongoose=require('mongoose');
const session=require('express-session');
const MongoStore=require('connect-mongodb-session')(session);
const multer=require('multer');
const {join}=require('path');
const csrf=require('csurf');
const csrfProtection=csrf();

const routes=require('./routes/routes');
const authRoutes=require('./routes/auth');
const errorHandlers=require('./controllers/errors');

const MONGO_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@theopenbook.q3gox.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,join(__dirname,'public','images'));
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now().toString()+'-'+file.originalname);
    }
});

const fileFilter=(req,file,cb)=>{
    if(
        file.mimetype==='image/png'||
        file.mimetype==='image/jpg'||
        file.mimetype==='image/jpeg'||
        file.mimetype==='image/bmp'
    ){cb(null,true);}
    else{cb(null,false);}
}

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

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));

app.use(express.static('public'));

app.set('view engine','ejs');

app.set('views','./views');

app.use(csrfProtection);

app.use(routes);
app.use(authRoutes);


app.use(errorHandlers.get404);

app.use(errorHandlers.get500);


mongoose
.connect(
    MONGO_URI,
    {
        useUnifiedTopology:true,
        useNewUrlParser:true
    }
)
.then(data=>{
    console.log('connected to DB');
    app.listen(process.env.PORT||3000,()=>{
        console.log(`listening at http://localhost:${process.env.PORT||3000}`);
    });
})
.catch(err=>{
    console.log(err);
})
