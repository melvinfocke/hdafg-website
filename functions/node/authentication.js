const RegistrationLog = require('../../models/registrationlog');
const { MAX_REGISTRATIONS_PER_DAY } = require('../../config');
const { convertToDateAsString } = require('../date');

async function ensureCanRegistrate(ip) {
    const dateNow = new Date();
    let registrationLog = await RegistrationLog.findById(ip);

    if (!registrationLog) {
        registrationLog = new RegistrationLog({
            _id: ip,
            lastRegistration: -1,
            amountOfRegistrations: 0
        });
    }
    if (dateNow.getTime() - registrationLog.lastRegistration > 86400000) registrationLog.amountOfRegistrations = 0;

    if (registrationLog.amountOfRegistrations >= MAX_REGISTRATIONS_PER_DAY) {
        await registrationLog.save();
        return false;
    }

    registrationLog.amountOfRegistrations++;
    registrationLog.lastRegistrationAsString = convertToDateAsString(dateNow);
    registrationLog.lastRegistration = dateNow.getTime();

    await registrationLog.save();
    return true;
}

module.exports = { ensureCanRegistrate };
