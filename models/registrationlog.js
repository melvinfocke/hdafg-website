const mongoose = require('mongoose');

const registrationLogSchema = new mongoose.Schema({
    _id: /*IP*/ {
        type: String,
        required: true
    },
    lastRegistrationAsString: {
        type: String,
        required: true,
        default: '00.00.0000 00:00:00'
    },
    lastRegistration: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    amountOfRegistrations: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('RegistrationLog', registrationLogSchema);
