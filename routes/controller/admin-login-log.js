const express = require('express');
const router = express.Router();
const { convertToDate } = require('../../functions/date');
const { ensureAuthenticated } = require('../../functions/controller/authentication');
const AdminLoginLog = require('../../models/adminloginlog');

const SITE_NAME = 'admin-login-log';

// Get AdminLoginLog dashboard
router.get(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const adminLoginLogArray = await AdminLoginLog.find();

    let out = '';
    let out0 = '';

    adminLoginLogArray.sort((a, b) => {
        if (a.lastFailedLogin < b.lastFailedLogin) return 1;
        if (a.lastFailedLogin > b.lastFailedLogin) return -1;
    });

    out0 += `<tr class="hoverable" id="newRow" style="display: none;"><td class="id editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="lastfailedlogin editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="amountoffailedlogins editable" contenteditable="true"><span></span></td><td class="editButton editButtonApply" onclick="addbutton('A');"><span>A</span></td><td class="deleteButton" onclick="addbutton('X');"><span>X</span></td></tr>`;

    adminLoginLogArray.forEach((adminLoginLog) => {
        out0 += `<tr class="hoverable" id="${adminLoginLog._id}"><td class="id"><span>${adminLoginLog._id}</span></td><td class="spacer"></td><td class="lastfailedlogin"><span>${adminLoginLog.lastFailedLoginAsString}</span></td><td class="spacer"></td><td class="amountoffailedlogins"><span>${adminLoginLog.amountOfFailedLogins}</span></td><td class="editButton" onclick="editbutton('${adminLoginLog._id}');"><span>E</span></td><td class="deleteButton" onclick="deletebutton('${adminLoginLog._id}');"><span>X</span></td></tr>`;
    });

    out = `<table><thead><tr><td class="id">IP</td><td class="spacer"></td><td class="lastfailedlogin">LastFailedLogin</td><td class="spacer"></td><td class="amountoffailedlogins">AmountOfFailedLogins</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    res.render('legacy-admin', { content: out, script: SITE_NAME });
});

// Create AdminLoginLog entry
router.post(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    let { id, lastFailedLoginAsString, amountOfFailedLogins } = req.body;
    lastFailedLoginAsString = lastFailedLoginAsString || '01.01.2000 00:00:00';

    const adminLoginLog = new AdminLoginLog({
        _id: id,
        lastFailedLoginAsString: lastFailedLoginAsString,
        lastFailedLogin: convertToDate(lastFailedLoginAsString),
        amountOfFailedLogins: amountOfFailedLogins
    });

    try {
        const newAdminLoginLog = await adminLoginLog.save();
        res.status(201).json(newAdminLoginLog);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Update AdminLoginLog entry
router.patch(`/admin/${SITE_NAME}/:id`, ensureAuthenticated, getAdminLoginLog, async (req, res) => {
    let adminLoginLog = res.adminLoginLog;
    const { lastFailedLoginAsString, amountOfFailedLogins } = req.body;
    if (!isNaN(amountOfFailedLogins)) adminLoginLog.amountOfFailedLogins = amountOfFailedLogins;
    if (lastFailedLoginAsString) {
        adminLoginLog.lastFailedLoginAsString = lastFailedLoginAsString;
        adminLoginLog.lastFailedLogin = convertToDate(lastFailedLoginAsString);
    }

    const updatedAdminLoginLog = await adminLoginLog.save();
    res.json(updatedAdminLoginLog);
});

// Delete AdminLoginLog entry
router.delete(`/admin/${SITE_NAME}/:id`, ensureAuthenticated, getAdminLoginLog, async (req, res) => {
    await res.adminLoginLog.remove();
    res.json({ message: 'Deleted admin login log entry' });
});

async function getAdminLoginLog(req, res, next) {
    const adminLoginLog = await AdminLoginLog.findById(req.params.id);
    if (!adminLoginLog) return res.status(404).json({ message: 'Cannot find admin login log entry' });

    res.adminLoginLog = adminLoginLog;
    next();
}

module.exports = router;
