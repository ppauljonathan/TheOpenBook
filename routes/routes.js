const router=require('express').Router();

const mainController=require('../controllers/main');

router.get('/',mainController.main);

module.exports=router;