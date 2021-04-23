const User = require("./models/User");

function ensureLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
    // if(req.session['user'] != undefined) {
    //     next();
    // } else {
    //     console.log('Not logged in.');

    // }
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            next();
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
}

async function updateUser(req) {
    if (!req.isAuthenticated()) return null;
    const user = await User.findById(req.user._id);
    req.user = user.toJSON();
    return user;
}

module.exports = { ensureLoggedIn, ensureAdmin, updateUser }