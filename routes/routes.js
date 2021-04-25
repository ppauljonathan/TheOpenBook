const router=require('express').Router();
const {body}=require('express-validator');

const mainController=require('../controllers/main');
const {isAuth}=require('../middleware/isAuth');

router.get('/',mainController.main);

router.get('/post/:postId',mainController.getSinglePost)

router.get('/create',isAuth,mainController.getCreate);
router.post(
    '/create',
    isAuth,
    [
        body('heading').trim(),
        body('content').trim()
    ],
    mainController.postCreate
);

router.get('/edit-post/:postId',isAuth,mainController.getEditPost);
router.post(
    '/edit-post/:postId',
    isAuth,
    [
        body('heading').trim(),
        body('content').trim()
    ],
    mainController.postEditPost
);

router.get('/profile',isAuth,mainController.getProfile);

module.exports=router;