const router=require('express').Router();

const mainController=require('../controllers/main');
const isAuth=require('../middleware/isAuth');

router.get('/',mainController.main);

router.get('/post/:postId',mainController.getSinglePost)
router.post('/delete-post/:postId',isAuth.isAuth,mainController.deletePost);

router.get('/create',isAuth.isAuth,mainController.getCreate);
router.post('/create',isAuth.isAuth,mainController.postCreate);

router.get('/profile',isAuth.isAuth,mainController.getProfile);

module.exports=router;