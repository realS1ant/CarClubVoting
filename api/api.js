const router = require('express').Router();
const { render } = require('ejs');
const passport = require('passport');
const carsRouter = require('./cars');

function ensureLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
    // if(req.session['user'] != undefined) {
    //     next();
    // } else {
    //     console.log('Not logged in.');

    // }
}

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Hi!'
    });
});

router.get('/auth/google', (req, res, next) => {
    const { redirect_to } = req.query;
    if (redirect_to) {
        req.session.redirect_to = redirect_to;
        next();
    } else next();
}, passport.authenticate('google', { session: false }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect(req.session.redirect_to || '/');
    delete req.session.redirect_to;
    req.session.save();
});

router.use('/cars', carsRouter);

//Error: next({ status: 420 });

module.exports = router;