const bcrypt = require('bcrypt');
const AdminLoginLog = require('../models/adminloginlog');
const RegistrationLog = require('../models/registrationlog');
const Admin = require('../models/admin');
const { MAX_FAILED_ADMIN_LOGINS_PER_DAY, MAX_REGISTRATIONS_PER_DAY } = require('../config');
const { autoRedirect } = require('../functions/redirect');
const { convertToDateAsString } = require('../functions/date');

async function ensureAuthenticated(req, res, next) {
    const dateNow = new Date();
    let adminLoginLog = await AdminLoginLog.findById(req.ip);

    if (!adminLoginLog) {
        adminLoginLog = new AdminLoginLog({
            _id: req.ip,
            lastFailedLoginAsString: '00.00.0000 00:00:00',
            lastFailedLogin: -1,
            amountOfFailedLogins: 0
        });
    }
    if (dateNow.getTime() - adminLoginLog.lastFailedLogin > 86400000) adminLoginLog.amountOfFailedLogins = 0;

    if (adminLoginLog.amountOfFailedLogins >= MAX_FAILED_ADMIN_LOGINS_PER_DAY) {
        return autoRedirect(res, {
            time: 10,
            responseCode: 429,
            message: `Too many failed login attempts. You can only make up to ${MAX_FAILED_ADMIN_LOGINS_PER_DAY} invalid logins per day per ip address. You will be redirected to the login page in 10 seconds.`,
            url: '/admin?failed'
        });
    }

    if (!req.isAuthenticated()) {
        adminLoginLog.amountOfFailedLogins++;
        adminLoginLog.lastFailedLoginAsString = convertToDateAsString(dateNow);
        adminLoginLog.lastFailedLogin = dateNow.getTime();

        await adminLoginLog.save();
        return autoRedirect(res, {
            time: 10,
            responseCode: 401,
            message: `Authentication failed. Invalid username or password. You will be redirected to the login page in 10 seconds.`,
            url: '/admin?failed'
        });
    }
    adminLoginLog.amountOfFailedLogins = 0;

    await adminLoginLog.save();
    next();
}

async function createDefaultAdminAccountIfNotExists() {
    let adminArray = await Admin.find();
    if (adminArray.length > 0) return;

    let admin = new Admin({
        _id: 'admin',
        password: await bcrypt.hash('admin', 10)
    });
    await admin.save();
}

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

    if (registrationLog.amountOfRegistrations > MAX_REGISTRATIONS_PER_DAY) {
        await registrationLog.save();

        //console.log(registrationLog);

        /*return autoRedirect(res, {
            time: 10,
            responseCode: 429,
            message: `Too many registration attempts. You can only make up to ${MAX_REGISTRATIONS_PER_DAY} registrations per day per ip address. You will be redirected to the event registration page in 10 seconds.`,
            url: `/${req.params.event}`
        });*/
        return false;
    }

    registrationLog.amountOfRegistrations++;
    registrationLog.lastRegistrationAsString = convertToDateAsString(dateNow);
    registrationLog.lastRegistration = dateNow.getTime();

    //console.log(registrationLog);

    await registrationLog.save();

    return true;
}

module.exports = { ensureAuthenticated, createDefaultAdminAccountIfNotExists, ensureCanRegistrate };
