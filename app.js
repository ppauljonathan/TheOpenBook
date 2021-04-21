const express=require('express');
const app=express();
require('dotenv').config();
const mongoose=require('mongoose');

const routes=require('./routes/routes');
const authRoutes=require('./routes/auth');
const errorHandlers=require('./controllers/errors');
const isAuth=require('./middleware/isAuth');

const MONGO_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@theopenbook.q3gox.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

app.set('view engine','ejs');

app.set('views','./views');

app.use(isAuth.clearSessions);

app.use(isAuth.assignUser);

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
)

app.listen(process.env.PORT||3000,()=>{
    console.log(`listening at http://localhost:${process.env.PORT||3000}`);
});