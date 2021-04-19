const router = require('express').Router();
const carsRouter = require('./cars');


router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Hi!'
    });
});

router.use('/cars', carsRouter);

//Error: next({ status: 420 });

module.exports = router;