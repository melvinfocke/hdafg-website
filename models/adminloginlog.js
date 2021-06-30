const mongoose = require('mongoose');

const adminLoginLogSchema = new mongoose.Schema({
    _id: /*IP*/ {
        type: String,
        required: true
    },
    lastFailedLoginAsString: {
        type: String,
        required: true,
        default: '00.00.0000 00:00:00'
    },
    lastFailedLogin: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    amountOfFailedLogins: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('AdminLoginLog', adminLoginLogSchema);
