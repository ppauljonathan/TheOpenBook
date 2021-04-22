const router=require('express').Router();
const {body}=require('express-validator');
const authControllers=require('../controllers/auth')
const isAuth=require('../middleware/isAuth');

router.get('/login',authControllers.getLogin);
router.post(
    '/login',
    [
        body('emailOrUsername')
        .trim(),
        body('password')
        .trim()    
    ],
    authControllers.postLogin
);

router.get('/signup',authControllers.getSignup);
router.post(
    '/signup',
    [
        body('email')
        .isEmail()
        .trim()
        .withMessage('Please enter a valid email'),
        body('username')
        .trim(),
        body('password')
        .trim()
        .isLength({min:5})
        .withMessage("password too short"),
        body('confirmPassword')
        .trim()
        .custom((val,{req})=>{
            if(val.toString()!==req.body.password.toString()){
                return Promise.reject("passwords do not match");
            }
            return true;
        })
    ],
    authControllers.postSignup
);

router.post('/delete-user/:userId',isAuth.isAuth,authControllers.deleteUser);

module.exports=router;