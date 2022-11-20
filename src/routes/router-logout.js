const router = require('express').Router();

router.get('/', function (req, res) {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.clearCookie('secretname');
        res.redirect('/login');
    });
});

module.exports = router;