const express = require('express');
const { isValidObjectId } = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');
const { ensureLoggedIn } = require('./utils');
const router = express.Router();

router.get('/', async (req, res, next) => {
    if (req.session['error']) {
        if (!req.isAuthenticated()) {
            res.render('index.ejs', { user: req.user, error: req.session.error });
            delete req.session['error'];
            req.session.save();
            return;
        }
        if (req.user.voted) {
            car = await Car.findById(req.user.voted._id);
            if (car) {
                req.user.voted = car;
            } else {
                delete req.user.voted;
                await User.findByIdAndUpdate(req.user._id, req.user);
            }
        }
        res.render('index.ejs', { user: req.user, error: req.session.error });
        delete req.session['error'];
        req.session.save();
    } else {
        if (req.isAuthenticated() && req.user.voted) {
            const car = await Car.findById(req.user.voted._id);
            if (car) {
                req.user.voted = car;
                await User.findByIdAndUpdate(req.user._id, req.user);
            } else {
                delete req.user.voted;
                await User.findByIdAndUpdate(req.user._id, req.user);
            }
        }
        res.render('index.ejs', { user: req.user });
    }
});

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) res.redirect('/')
    else res.render('login.ejs');
});

router.get('/logout', ensureLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/registration', async (req, res, next) => {
    if(req.session.registeredCars && req.session.registeredCars.length >= 3) { //Soft way to prevent spam, since we don't want to stop people from registering their car if they dont have a google/facebook account.
        req.session.error = 'You have already registered three cars! If you wish to register more contact Thad at 2024052@sluh.org';
        req.session.save();
        res.redirect('/');
        return;
    } else {
        const cars = req.session.registeredCars ? await Promise.all(req.session.registeredCars.map(carId => Car.findById(carId))) : [];
        res.render('registration.ejs', { registeredCars: cars });
    }
});

router.get('/test', async (req, res) => {
    req.session.registeredCars = ['624e56c642ffc32b242c9c33'];
    req.session.save();
    res.redirect('/');
});

router.get('/car/:query', async (req, res) => {
    const { query } = req.params;
    if (!query) {
        res.render('car.ejs', { user: req.user, error: 'Invalid URL.' });
        return;
    }
    let car;
    if (isValidObjectId(query)) {
        car = await Car.findById(query);
    } else {
        car = await Car.findOne({ searchPhrase: query.toLowerCase() });
    }
    if (car) {
        let carobj = car.toObject();
        delete carobj['votes']; //so we don't expose the **super secret** votes to our lovely users
        res.render('car.ejs', { user: req.user, car: carobj });
    } else {
        res.render('car.ejs', { user: req.user, error: 'Can\'t find that car!' });
    }
});

module.exports = router;