const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const Car = require('../models/Car.js');

//Create a car obj
router.post('/', async (req, res, next) => {
    const { make, model, year, owner } = req.body;
    if (!(make && model && year && owner)) {
        res.status(400).json({ message: "Invalid Input(make, model, year, and owner)." });
        return;
    }

    const car = await new Car({
        make,
        model,
        year,
        owner
    }).save();
    res.status(201).json({ car });
});

//Get Car by id
router.get('/:carId', async (req, res, next) => {
    const { carId } = req.params;

    if (!carId || !isValidObjectId(carId)) {
        res.status(400).json({
            success: false,
            message: 'Invalid Car Id',
            car: {}
        });
        return;
    }

    const car = await Car.findById(carId).exec();
    if (car) {
        res.status(200).json({
            success: true,
            car
        });
    } else {
        //204 no content
        res.status(204).json({
            success: false,
            message: 'No car found'
        });
    }
});

//Update Car
router.put('/:carId', async (req, res, next) => {
    const { carId } = req.params;
    const { make, model, year, owner, votes } = req.body;

    if (!carId || !(make || model || year || owner || votes) || !isValidObjectId(carId)) {
        res.status(400).json({
            success: false,
            message: 'Invalid Car Id or body'
        });
        return;
    }

    const car = await Car.findByIdAndUpdate(carId, req.body);

    if (car == null) {
        res.status(400).json({
            success: false,
            message: 'Incorrect Car Id'
        });
        return;
    }

    res.status(200).json({
        success: true,
        car
    });
    // const car = await Car.findById(carId);

    // car['make'] = make || car['make'];
    // car['model'] = model || car['model'];
    // car['year'] = year || car['year'];
    // car['owner'] = owner || car['owner'];
    // car['votes'] = votes || car['votes'];

    // car.update();
});

router.delete('/:carId', async (req, res, next) => {
    const { carId } = req.params;

    if (!carId || !isValidObjectId(carId)) {
        res.status(400).json({
            success: false,
            message: 'Invalid Car Id'
        });
        return;
    }

    const car = await Car.findByIdAndRemove(carId);
    if (car == null) {
        //Car not found
        res.status(204).json({
            success: false,
            message: 'No car found'
        });
        return;
    }
    res.status(200).json({
        success: true,
        car
    });
});

module.exports = router;