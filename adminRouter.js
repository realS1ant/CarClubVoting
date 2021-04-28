const express = require('express');
const admin = express.Router();
const adminApi = express.Router();

function secureEndpoint(req, res, next) {
    if (req.isAuthenticated() && req.user['admin']) {
        next();
    } else {
        res.redirect('/login');
    }
}

admin.use(secureEndpoint);
adminApi.use(secureEndpoint);

admin.get('/', (req, res) => {
    res.render('admin/dash.ejs');
});

adminApi.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Admin Api base endpoint'
    });
});
module.exports = {
    adminRouter: admin,
    adminApiRouter: adminApi
};