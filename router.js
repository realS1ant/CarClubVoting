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
            req.user.voted = await Car.findById(req.user.voted._id);
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
        console.log('sAD')
        if (req.isAuthenticated() && req.user.voted) {
            console.log('ooasd')
            const car = await Car.findById(req.user.voted._id);
            console.log('yopoo')
            if (car) {
                console.log(car);
                req.user.voted = car;
                await User.findByIdAndUpdate(req.user._id, req.user);
            } else {
                console.log('none of that')
                delete req.user.voted;
                await User.findByIdAndUpdate(req.user._id, req.user);
            }
        } else console.log('no auth?' + req.isAuthenticated() + ' ' + req.user.voted);
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