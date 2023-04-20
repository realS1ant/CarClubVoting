const router = require('express').Router();
const { getConfig, setConfig } = require('../config');

router.use((req, res, next) => {
    if (req.isAuthenticated() && req.user['admin']) {
        next();
    } else {
        res.status(401);
    }
});

router.get('/config', (req, res) => {
    res.status(200).json({
        data: getConfig()
    });
})

router.patch('/config', (req, res) => {
    //TODO: Maybe validation, or only update changed values (or only send changed values from client side)
    setConfig(req.body);

    res.status(200).json({
        message: 'Successfully updated the configuration values!'
    });
})

module.exports = router;