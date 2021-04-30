const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const Car = require('../models/Car.js');

// router.use((req, res, next) => {
//     if (req.isAuthenticated() && req.user['admin']) {
//         next();
//     } else {
//         res.status(401);
//     }
// });

//Create a car obj
router.post('/', async (req, res, next) => {
    const { make, model, year, owner, searchPhrase } = req.body;
    if (!(make && model && year && owner)) {
        console.log(req.body);
        res.status(400).json({ success: false, message: "Invalid Input(make, model, year, and owner)." });
        return;
    }

    if (searchPhrase) {
        const car = await Car.findOne({ searchPhrase: searchPhrase.toLowerCase() }).exec();
        if (car) {
            res.status(409).json({
                success: false,
                message: 'Search Phrase already in use!'
            });
            return;
        } else {
            const newCar = await new Car({
                make,
                model,
                year,
                owner,
                searchPhrase: searchPhrase.toLowerCase()
            }).save();
            res.status(201).json({ success: true, message: 'Car successfully created.', car: newCar });
        }
    } else {
        const car = await new Car({
            make,
            model,
            year,
            owner,
        }).save();
        res.status(201).json({ success: true, message: 'Car successfully created.', car });
        return;
    }
});

router.get('/highestvotes', async (req, res, next) => {
    if (!(req.isAuthenticated() && req.user['admin'])) {
        res.status(401).json({
            message: 'Unauthorized'
        });
        return;
    }

    const votes = (await Car.find().sort({ 'votes': -1 }).limit(1))[0].votes; //find the number for the votes.
    const cars = await Car.find({ votes });
    res.status(200).json({
        votes,
        cars
    });
});

//Get Car by id
router.get('/:query', async (req, res, next) => {
    const { query } = req.params;

    if (!query) {
        res.status(400).json({
            success: false,
            message: 'Invalid Query',
            car: {}
        });
    }

    // if (!carId || !isValidObjectId(query)) {
    //     res.status(400).json({
    //         success: false,
    //         message: 'Invalid Car Id',
    //         car: {}
    //     });
    //     return;
    // }

    if (isValidObjectId(query)) {
        try {
            const car = await Car.findById(query).exec();
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
            return;
        } catch (e) {
            console.log('Error fetching car by ID: ' + query);
            res.status(500).json({
                success: false,
                message: 'Internal Error'
            });
            return;
        }
    } else {
        try {
            const car = await Car.findOne({ searchPhrase: query.toLowerCase() }).exec();
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
            return;
        } catch (e) {
            console.log('Error fetching car by ID: ' + query);
            res.status(500).json({
                success: false,
                message: 'Internal Error'
            });
            return;
        }
    }
});

//Update Car
router.put('/:query', async (req, res, next) => {
    const { query } = req.params;
    const { make, model, year, owner, votes, searchPhrase } = req.body;

    if (!query || !(make || model || year || owner || votes || searchPhrase)) {
        res.status(400).json({
            success: false,
            message: 'Invalid Car Id or body'
        });
        return;
    }

    if (isValidObjectId(query)) {
        const car = await Car.findByIdAndUpdate(query, req.body);

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
        return;
    } else {
        const car = await Car.findOneAndUpdate({ searchPhrase: query.toLowerCase() }, req.body);

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
        return;
    }
});

router.delete('/:query', async (req, res, next) => {
    const { query } = req.params;

    if (!query) {
        res.status(400).json({
            success: false,
            message: 'Invalid Query'
        });
        return;
    }
    if (isValidObjectId(query)) {
        const car = await Car.findByIdAndRemove(query);
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
        return;
    } else {
        const car = await Car.findOneAndRemove({ searchPhrase: query.toLowerCase() });
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
        return;
    }
});

module.exports = router;