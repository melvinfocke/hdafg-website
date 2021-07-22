const mongoose = require('mongoose');

const setupSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    startedAt: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    currentPage: {
        type: Number,
        required: true
    },
    data: {
        type: /*mongoose.Schema.Types.Mixed*/ String,
        required: true,
        default: '{|,|}'
    },
    tempData: {
        type: String,
        required: true,
        default: '{|,|}'
    },
    currentPageData: {
        type: String,
        required: true,
        default: '{|,|}'
    }
});

module.exports = mongoose.model('Setup', setupSchema);
