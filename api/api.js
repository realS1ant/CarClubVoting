const router = require('express').Router();
const { render } = require('ejs');
const { isValidObjectId } = require('mongoose');
const passport = require('passport');
const Car = require('../models/Car');
const { ensureLoggedIn, updateUser } = require('../utils');
const carsRouter = require('./cars');
const adminRouter = require('./admin');
const { getValue } = require('../config');
const User = require('../models/User');

const ensureVotingOpen = async (req, res, next) => {
    if (getValue('voting')) next();
    else {
        req.session.error = "Sorry, we aren't currently open for voting.";
        req.session.save();
        res.redirect('/');
        return;
    }
};

const ensureCanVote = async (req, res, next) => {
    if (getValue('requireLogin')) ensureLoggedIn(req, res, next);
    else next();
}

const ensureRegistrationOpen = async (req, res, next) => {
    if (getValue('registration')) next();
    else {
        res.redirect('/');
        return;
    }
};

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


//TODO: make session['voted'] store and id instead of copy of the object... (why the hell did I do that in the first place???)
/*router.get('/vote/:carId', ensureLoggedIn, ensureVotingOpen, async (req, res, next) => {
    const { carId } = req.params;
    if (!carId || !isValidObjectId(carId)) {
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
        user.voted = carId;
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
*/

router.get('/vote/:carId', ensureVotingOpen, ensureCanVote, async (req, res, next) => {
    const { carId } = req.params;
    if (!carId || !isValidObjectId(carId)) {
        res.status(400).json({
            success: false,
            error: 'Invalid Car ID'
        });
        return;
    }

    voted = getValue('requireLogin') ? (await User.findById(req.user._id)).votedId != undefined : req.session.votedId != undefined;
    if (voted) {
        req.session.error = 'You have already voted!';
        res.redirect('/');
        return;
    }

    const car = await Car.findById(carId);
    if (!car) {
        req.session['error'] = 'Incorrect Car ID';
        res.redirect('/');
        return;
    }

    if (getValue('requireLogin')) User.findByIdAndUpdate(req.user._id, { votedId: carId });
    else req.session.votedId = carId;
    car.votes += 1;
    car.save();

    res.status(200).redirect(`/car/${carId}`);
});

router.post('/register', ensureRegistrationOpen, async (req, res) => {
    const { make, model, year, owner } = req.body;
    if (!(make && model && year && owner)) {
        res.status(400).json({ success: false, message: "Invalid Input(make, model, year, and owner)." });
        return;
    }

    //Ensure they haven't already registered 3 or more, to prevent spam
    if (req.session.registeredCars && req.session.registeredCars.length >= 3) {
        res.status(409).json({
            success: false,
            message: "Sorry, but you've already registered three cars! If you wish to register more please contant Thad at 2024052@sluh.org"
        });
        return;
    }

    //Check if that car was already registered by this session, can't really do anything becuse more than one person could have a 2015 Ford Mustang and I don't want to check names.
    if (req.session.registeredCars && req.session.registeredCars.length > 0) {
        for (const carId of req.session.registeredCars) {
            let car = await Car.findById(carId);
            if (make === car.make && model === car.model && year === car.year) {
                res.status(409).json({
                    success: false,
                    message: "You've already registered this car!"
                });
                return;
            }
        }

    }

    const car = await new Car({ make, model, year, owner }).save();
    res.status(201).json({
        success: true,
        message: "Car successfully registered!",
        car
    });
    let cars = req.session.registeredCars ? [...req.session.registeredCars] : [];
    cars.push(car.id);
    req.session.registeredCars = cars;
    req.session.save();
});

router.use('/cars', carsRouter);
router.use('/admin', adminRouter);


//Error: next({ status: 420 });

module.exports = router;