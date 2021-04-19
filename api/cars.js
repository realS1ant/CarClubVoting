const router = require('express').Router();


//get all cars maybe
router.get('/', (req, res, next) => {
    res.status(200).json({
        cars: [{
            make: 'Ford',
            model: 'Bronco',
            year: 1997
        },
        {
            make: 'Chevrolet',
            model: 'Impala',
            year: 1969
        }]
    });
});

router.get('/:id', (req, res, next) => {
    res.json({
        message: 'Retreived Car'
    });
});

//Create a car obj
router.post('/', (req, res, next) => {
    res.json({
        message: 'Created Car'
    });
});

router.put('/:id', (req, res, next) => {
    res.json({
        message: 'Updated Car'
    });
})

module.exports = router;