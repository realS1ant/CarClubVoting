const router = require('express').Router();

router.use((req, res, next) => {
    if (req.isAuthenticated() && req.user['admin']) {
        next();
    } else {
        res.status(401);
    }
});

router.get('/', (req, res) => {
    res.json({
        message: "admin api."
    });
})

module.exports = router;