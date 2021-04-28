const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    make: {
        type: String,
        require: true
    },
    model: {
        type: String,
        require: true
    },
    year: {
        type: Number,
        require: true
    },
    searchPhrase: {
        type: String,
        require: false
    },
    owner: {
        type: String,
        require: true
    },
    votes: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Car', carSchema);