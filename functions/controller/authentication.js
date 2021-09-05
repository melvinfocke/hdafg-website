const AdminLoginLog = require('../../models/adminloginlog');
const { MAX_FAILED_ADMIN_LOGINS_PER_DAY } = require('../../config');
const { send401Page } = require('./error401');
const { convertToDateAsString } = require('../date');

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
        return send401Page(res);
    }

    if (!req.isAuthenticated()) {
        adminLoginLog.amountOfFailedLogins++;
        adminLoginLog.lastFailedLoginAsString = convertToDateAsString(dateNow);
        adminLoginLog.lastFailedLogin = dateNow.getTime();

        await adminLoginLog.save();
        return send401Page(res);
    }
    adminLoginLog.amountOfFailedLogins = 0;

    await adminLoginLog.save();
    next();
}

module.exports = { ensureAuthenticated };
