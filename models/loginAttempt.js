const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    success: {
        type: Boolean,
        required: true,
    },
    attempts: {
        type: Number,
        required: true,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
