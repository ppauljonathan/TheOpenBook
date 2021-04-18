const router=require('express').Router();
const authControllers=require('../controllers/auth');

router.get('/login',authControllers.getLogin);

router.get('/signup',authControllers.getSignup);

module.exports=router;