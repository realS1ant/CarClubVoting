const router = require('express').Router();
const { render } = require('ejs');
const { isValidObjectId } = require('mongoose');
const passport = require('passport');
const Car = require('../models/Car');
const { ensureLoggedIn, updateUser } = require('../utils');
const carsRouter = require('./cars');

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

router.get('/vote/:carId', ensureLoggedIn, async (req, res, next) => {
    const { carId } = req.params;
    if (!carId || !isValidObjectId(carId)) {
        console.log('asd')
        res.status(400).json({
            success: false,
            error: 'Invalid Car ID'
        });
        return;
    }
    const user = await updateUser(req);
    if (!user.voted) {
        const car = await Car.findById(carId);
        if (!car) {
            req.session['error'] = 'Incorrect Car ID';
            res.redirect('/');
            return;
        }
        user.voted = car; //I've come to the conclusion that we don't want to store actual objects and just the ID because the car obj could get updated
        //Update: I was worried about having old references of the object, but I just switched it to pull a new object based on the id every time it loads the index page.
        user.save();
        car.votes += 1;
        car.save();
    } else {
        req.session['error'] = 'You already voted!';
        res.redirect('/');
        return;
    }
    res.redirect(`/car/${carId}`);
});

router.use('/cars', carsRouter);

//Error: next({ status: 420 });

module.exports = router;