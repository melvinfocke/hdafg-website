const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../functions/controller/authentication');
const { convertToDate } = require('../../functions/date');
const RegistrationLog = require('../../models/registrationlog');

const SITE_NAME = 'registration-log';

// Get RegistrationLog dashboard
router.get(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const registrationLogArray = await RegistrationLog.find();

    let out = '';
    let out0 = '';
    registrationLogArray.sort((a, b) => {
        if (a.lastRegistration < b.lastRegistration) return 1;
        if (a.lastRegistration > b.lastRegistration) return -1;
    });

    out0 += `<tr class="hoverable" id="newRow" style="display: none;"><td class="id editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="lastregistration editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="amountofregistrations editable" contenteditable="true"><span></span></td><td class="editButton editButtonApply" onclick="addbutton('A');"><span>A</span></td><td class="deleteButton" onclick="addbutton('X');"><span>X</span></td></tr>`;

    registrationLogArray.forEach((registrationLog) => {
        out0 += `<tr class="hoverable" id="${registrationLog._id}"><td class="id"><span>${registrationLog._id}</span></td><td class="spacer"></td><td class="lastregistration"><span>${registrationLog.lastRegistrationAsString}</span></td><td class="spacer"></td><td class="amountofregistrations"><span>${registrationLog.amountOfRegistrations}</span></td><td class="editButton" onclick="editbutton('${registrationLog._id}');"><span>E</span></td><td class="deleteButton" onclick="deletebutton('${registrationLog._id}');"><span>X</span></td></tr>`;
    });

    out = `<table><thead><tr><td class="id">IP</td><td class="spacer"></td><td class="lastregistration">LastRegistration</td><td class="spacer"></td><td class="amountofregistrations">AmountOfRegistrations</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    res.render('legacy-admin', { content: out, script: SITE_NAME });
});

// Create RegistrationLog entry
router.post(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    let { id, lastRegistrationAsString, amountOfRegistrations } = req.body;
    lastRegistrationAsString = lastRegistrationAsString || '01.01.2000 00:00:00';

    const registrationLog = new RegistrationLog({
        _id: id,
        lastRegistrationAsString: lastRegistrationAsString,
        lastRegistration: convertToDate(lastRegistrationAsString),
        amountOfRegistrations: amountOfRegistrations
    });

    try {
        const newRegistrationLog = await registrationLog.save();
        res.status(201).json(newRegistrationLog);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Update RegistrationLog entry
router.patch(`/admin/${SITE_NAME}/:id`, ensureAuthenticated, getRegistrationLog, async (req, res) => {
    let registrationLog = res.registrationLog;
    const { lastRegistrationAsString, amountOfRegistrations } = req.body;
    if (!isNaN(amountOfRegistrations)) registrationLog.amountOfRegistrations = amountOfRegistrations;
    if (lastRegistrationAsString) {
        registrationLog.lastRegistrationAsString = lastRegistrationAsString;
        registrationLog.lastRegistration = convertToDate(lastRegistrationAsString);
    }

    const updatedRegistrationLog = await registrationLog.save();
    res.json(updatedRegistrationLog);
});

// Delete RegistrationLog entry
router.delete(`/admin/${SITE_NAME}/:id`, ensureAuthenticated, getRegistrationLog, async (req, res) => {
    await res.registrationLog.remove();
    res.json({ message: 'Deleted registration log entry' });
});

async function getRegistrationLog(req, res, next) {
    const registrationLog = await RegistrationLog.findById(req.params.id);
    if (!registrationLog) return res.status(404).json({ message: 'Cannot find registration log entry' });

    res.registrationLog = registrationLog;
    next();
}

module.exports = router;
