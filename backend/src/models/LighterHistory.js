const mongoose = require('mongoose');

const lighterHistorySchema = new mongoose.Schema({
    lighterNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 25
    },
    source: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: '匿名用户'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LighterHistory', lighterHistorySchema); 