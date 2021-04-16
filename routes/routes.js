const router=require('express').Router();

const mainController=require('../controllers/main');

router.get('/',mainController.main);

router.get('/create',mainController.getCreate);
router.post('/create',mainController.postCreate);

module.exports=router;