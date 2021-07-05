const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    dateAsString: {
        type: String,
        required: true,
        default: '00.00.0000 00:00:00'
    },
    date: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: 'undefined'
    },
    isVisible: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('event', eventSchema);
