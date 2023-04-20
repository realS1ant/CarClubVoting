const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    iconURL: {
        type: String,
        required: false
    },
    googleID: {
        type: String,
        required: false
    },
    votedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);