const express = require('express');
const { isValidObjectId } = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');
const { ensureLoggedIn } = require('./utils');
const router = express.Router();

router.get('/', async (req, res, next) => {
    if (req.session['error']) {
        if (req.user.voted) {
            req.user.voted = await Car.findById(req.user.voted._id);
        }
        res.render('index.ejs', { user: req.user, error: req.session.error });
        delete req.session['error'];
        req.session.save();
    } else {
        if (req.user && req.user.voted) {
            const car = await Car.findById(req.user.voted._id);
            req.user.voted = car;
            await User.findByIdAndUpdate(req.user._id, req.user);
        }
        res.render('index.ejs', { user: req.user });
    }
});

router.get('/login', (req, res, next) => {
    res.render('login.ejs');
});

router.get('/logout', ensureLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/car/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.render('car.ejs', { user: req.user, error: 'Can\'t find that car!' });
        return;
    }
    const car = await Car.findById(id);
    if (car) {
        let carobj = car.toObject();
        delete carobj['votes']; //so we don't expose the **super secret** votes to our lovely users
        res.render('car.ejs', { user: req.user, car: carobj });
    } else {
        res.render('car.ejs', { user: req.user, error: 'Can\'t find that car!' });
    }
});

module.exports = router;