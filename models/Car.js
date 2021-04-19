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
    owner: {
        type: String,
        require: false,
        default: "No Owner Specified."
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Car', carSchema);