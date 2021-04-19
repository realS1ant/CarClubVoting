const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const helmet = require('helmet');
const cors = require('cors');
const apiRouter = require('./api/api.js');
require('dotenv').config();

mongoose.connect(process.env.MONGOURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, err => {
    if (err) console.log(err);
    else console.log('Mongoose Connected.');
});

app.set('view engeine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.json());
app.use(express.static(__dirname + '/public'))
app.use(helmet());
app.use(cors());

app.use('/api', apiRouter);

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
app.listen(port, () => { console.log(`Server running on: ${hostname}:${port}`) })