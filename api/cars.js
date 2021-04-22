const router = require('express').Router();
const Car = require('../models/Car.js');

function ensureAdmin(req, res, next) {
    if (req.session['user'] != undefined) {
        if (req.session['user'].admin) {
            next();
        } else {
            res.redirect('/');
            return;
        }
    } else {
        res.redirect('/login');
        return;
    }
}

//Create a car obj
router.post('/', async (req, res, next) => {
    const { make, model, year, owner } = req.body;
    if (!(make && model && year && owner)) {
        res.status(400).json({ message: "Invalid Input(make, model, year, and owner)." });
        return;
    }

    const newCar = await new Car({
        make,
        model,
        year,
        owner
    }).save();
    res.status(200).json({ car: newCar });
});

//Get Car by id
router.get('/:id', (req, res, next) => {
    res.json({
        message: 'Retreived Car'
    });
});

//Update Car
router.put('/:id', (req, res, next) => {
    res.json({
        message: 'Updated Car'
    });
});

router.delete('/:id', (req, res, next) => {
    if (typeof req.params.id != String) {
        res.status()
        return;
    }

    res.json({
        message: 'Delete Car'
    });
});

module.exports = router;