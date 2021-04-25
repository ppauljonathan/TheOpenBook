const router=require('express').Router();

const mainController=require('../controllers/main');
const {isAuth}=require('../middleware/isAuth');

router.get('/',mainController.main);

router.get('/post/:postId',mainController.getSinglePost)

router.get('/create',isAuth,mainController.getCreate);
router.post('/create',isAuth,mainController.postCreate);

module.exports=router;