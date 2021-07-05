const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    givenName: {
        type: String,
        required: true
    },
    surName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        required: true,
        default: 'undefined'
    },
    event: {
        type: String,
        required: true,
        default: 'undefined'
    },
    dateAsString: {
        type: String,
        required: true,
        default: '00.00.0000 00:00:00'
    },
    date: {
        type: Number,
        required: true,
        default: new Date().getTime()
    }
});

module.exports = mongoose.model('registration', registrationSchema);
