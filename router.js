const express = require('express');
const { isValidObjectId } = require('mongoose');
const Car = require('./models/Car');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index.ejs', { user: req.user });
});

router.get('/login', (req, res, next) => {
    res.render('login.ejs');
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
        delete carobj['votes'];
        res.render('car.ejs', { user: req.user, car: carobj });
    } else {
        res.render('car.ejs', { user: req.user, error: 'Can\'t find that car!' });
    }
});

router.get('/vote', (req, res, next) => {
    res.render('index.ejs');
});

module.exports = router;