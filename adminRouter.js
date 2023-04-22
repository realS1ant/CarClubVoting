const express = require('express');
const admin = express.Router();

admin.use((req, res, next) => {
    if (req.isAuthenticated() && req.user['admin']) next();
    else res.redirect('/login');
});

admin.get('/', (req, res) => {
    res.render('admin/dash.ejs');
});

admin.get('/votes', (req, res) => {
    res.render('admin/votes.ejs');
});

admin.get('/events', (req, res) => {
    res.render('admin/events.ejs');
});

admin.get('/cars', (req, res) => {
    res.render('admin/cars.ejs');
});

admin.get('/archive', (req, res) => {
    res.render('admin/archive.ejs');
});

admin.get('/users', (req, res) => {
    res.render('admin/users.ejs');
});

admin.get('/config', (req, res) => {
    res.render('admin/config.ejs');
})

module.exports = {
    adminRouter: admin
};