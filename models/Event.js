const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    details: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Event', eventSchema);