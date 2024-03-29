const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const ejs = require('ejs');
const helmet = require('helmet');
const cors = require('cors');
const MongoStore = require('connect-mongo')(session);
const fetch = require('node-fetch');
const User = require('./models/User.js');
const apiRouter = require('./api/api.js');
const { adminRouter } = require('./adminRouter.js');
const router = require('./router.js');
if (!process.env.MONGOURI) require('dotenv').config(); //If env vars already defined we don't need dotenv (development only)

mongoose.connect(process.env.MONGOURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
}, err => {
    if (err) console.log(err);
    else console.log('Mongoose Connected.');
});

app.set('view engeine', 'ejs');
app.set('views', __dirname + '/views');
app.set('trust proxy', 1) // trust first proxy
app.use(express.json());
app.use(express.static(__dirname + '/public'))
app.use(helmet());
app.use(cors());


const behindProxy = !(process.env.ENV === 'dev');
app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    proxy: behindProxy,
    cookie: {
        //remove maxAge to keep session cooke as long as we can.
        //maxAge: 172800000, // 172800000 ms = 2 days (2 * 24 * 60 * 60 * 1000)
        secure: behindProxy
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use('google', new GoogleStrategy(
    {
        clientID: process.env.GOOGLECID,
        clientSecret: process.env.GOOGLESECRET,
        callbackURL: `${process.env.HOSTNAME}/api/auth/google/callback`,
        scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
    },
    async (accessToken, refreshToken, profile, done) => {
        if (!profile._json.email_verified) {
            console.log('Unverified Email!');
            done('Unverified Email!');
            return;
        }
        try {
            const user = await User.findOne({ googleID: profile.id }).exec();
            if (user) {
                //Found db user
                console.log(`Found db user: ${user.name}`);
                done(null, user);
            } else {
                //No user in database
                console.log('new user: ' + profile._json.name);
                const createdUser = await new User({
                    name: profile._json.name,
                    email: profile._json.email,
                    iconURL: profile._json.picture,
                    googleID: profile.id
                }).save();
                done(null, createdUser);
                return;
            }
        } catch (e) {
            if (e) {
                console.log('Error while finding database user with google id.')
                console.error(e);
            }
            done(e);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user.toJSON()));
});

app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', router);

//Not Found - 404
app.use((req, res, next) => {
    next({ status: 404 });
})
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if (err.status == 404) {
        res.render('errors/404.ejs');
    } else {
        res.render('errors/error.ejs', { errorCode: err.status || 500 });
    }
})

const port = process.env.PORT || 5000;
const hostname = process.env.HOSTNAME || 'http://localhost';
app.listen(port, () => { console.log(`Server running on: ${hostname}`) })