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

router.patch('/setconfig', (req, res) => {
    try {
        const { voting, registration } = req.body;

        if (voting == undefined && registration == undefined) {
            res.status(204)
            return;
        }
        let data = getConfig();

        if (voting != undefined) data.votingOpen = voting;
        if (registration != undefined) data.registrationOpen = registration;

        setConfig(data);

        res.status(200).json({
            data,
            message: 'Successfully updated the configuration values!'
        });
    } catch (e) {
        console.error(e)
    }
});

module.exports = router;