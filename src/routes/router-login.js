const router = require('express').Router();
const loginController = require('../controllers').login;
const verifyUser = require('../config/verify');

router.get('/', verifyUser.isLogout, loginController.login);
router.post('/auth', loginController.loginAuth);

module.exports = router;