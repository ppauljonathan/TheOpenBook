const router=require('express').Router();
const {body}=require('express-validator');

const authControllers=require('../controllers/auth');
const {remAuth,isAuth}=require('../middleware/isAuth');

router.get('/login',remAuth,authControllers.getLogin);
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

router.get('/signup',remAuth,authControllers.getSignup);
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

router.get('/reset-pwd/:token',remAuth,authControllers.getReset);
router.post(
    '/reset-pwd/:token',
    [
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
    authControllers.postReset
)

router.get('/otp',authControllers.getOTP);
router.post('/otp',authControllers.postOTP);


router.get('/reseter',remAuth,authControllers.getReseter);
router.post('/reseter',remAuth,authControllers.postReseter);

router.post('/delete-user/:id',authControllers.postDeleteUser);
module.exports=router;