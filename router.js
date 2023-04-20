const express = require('express');
const { isValidObjectId } = require('mongoose');
const Car = require('./models/Car');
const User = require('./models/User');
const { ensureLoggedIn } = require('./utils');
const router = express.Router();
const { getValue } = require('./config');

const ensureVotingOpen = async (req, res, next) => {
    if (getValue('voting')) next();
    else {
        req.session.error = "Sorry, we aren't currently open for voting.";
        req.session.save();
        res.redirect('/');
        return;
    }
};

const ensureRegistrationOpen = async (req, res, next) => {
    if (getValue('registration')) next();
    else {
        res.redirect('/');
        return;
    }
};

router.get('/', async (req, res) => {
    let registration = getValue('registration');
    let voting = getValue('voting');
    let requireLogin = getValue('requireLogin');
    let votedId = requireLogin ? req.user.votedId : req.session.votedId;
    let admin = req.user.admin;

    let vars = { registration, voting, requireLogin, votedId, admin };

    if (votedId != undefined) {
        console.log(votedId)
        vars.car = await Car.findById(votedId);
    }
    console.log(vars)
    res.render('index.ejs', vars);
});

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) res.redirect('/')
    else res.render('login.ejs');
});

router.get('/logout', ensureLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/registration', ensureRegistrationOpen, async (req, res, next) => {
    if (req.session.registeredCars && req.session.registeredCars.length >= 3) { //Soft way to prevent spam, since we don't want to stop people from registering their car if they dont have a google/facebook account.
        req.session.error = 'You have already registered three cars! If you wish to register more contact Thad at 2024052@sluh.org';
        req.session.save();
        res.redirect('/');
        return;
    } else {
        const cars = req.session.registeredCars ? await Promise.all(req.session.registeredCars.map(carId => Car.findById(carId))) : [];
        res.render('registration.ejs', { registeredCars: cars });
    }
});


router.get('/car/:query', ensureVotingOpen, async (req, res) => {
    const { query } = req.params;
    if (!query) {
        res.render('car.ejs', { error: 'Invalid URL.' });
        return;
    }
    let car;
    if (isValidObjectId(query)) {
        car = await Car.findById(query);
    } else {
        car = await Car.findOne({ searchPhrase: query.toLowerCase() });
    }

    let requireLogin = getValue('requireLogin');
    let votedId;
    if (requireLogin) votedId = req.user.votedId;
    else votedId = req.session.votedId;
    if (car) {
        let carobj = car.toObject();
        delete carobj['votes']; //so we don't expose the **super secret** votes to our lovely users
        res.render('car.ejs', { votedId, car: carobj, requireLogin, user: req.user });
    } else {
        res.render('car.ejs', { user: req.user, error: 'Can\'t find that car!', requireLogin });
    }
});

module.exports = router;