const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../functions/authentication');
const { sendContentAsPage } = require('../functions/templatepage');
const { convertToDate, convertToDateAsString } = require('../functions/date');
const Registration = require('../models/registration');

const SITE_NAME = 'admin/registrations';
const FILE_NAME = 'admin-registrations';

// Get registrations dashboard
router.get(`/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const registrationArray = await Registration.find();

    let out = '';
    let out0 = '';

    registrationArray.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
    });

    out0 += `<tr class="hoverable" id="newRow" style="display: none;"><td class="id"><span>xxxxxxxxxxxxxxxxxxxxxxxx</span></td><td class="spacer"></td><td class="givenname editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="surname editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="phone editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="remarks editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="event editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="date editable" contenteditable="true"><span></span></td><td class="editButton editButtonApply" onclick="addbutton('A');"><span>A</span></td><td class="deleteButton" onclick="addbutton('X');"><span>X</span></td></tr>`;

    registrationArray.forEach((registration) => {
        out0 += `<tr class="hoverable" id="${registration._id}"><td class="id"><span>${registration._id}</span></td><td class="spacer"></td><td class="givenname"><span>${registration.givenName}</span></td><td class="spacer"></td><td class="surname"><span>${registration.surName}</span></td><td class="spacer"></td><td class="phone"><span>${registration.phone}</span></td><td class="spacer"></td><td class="remarks"><span>${registration.remarks}</span></td><td class="spacer"></td><td class="event"><span>${registration.event}</span></td><td class="spacer"></td><td class="date"><span>${registration.dateAsString}</span></td><td class="editButton" onclick="editbutton('${registration._id}');"><span>E</span></td><td class="deleteButton" onclick="deletebutton('${registration._id}');"><span>X</span></td></tr>`;
    });

    out = `<table><thead><tr><td class="id">ID</td><td class="spacer"></td><td class="givenname">GivenName</td><td class="spacer"></td><td class="surname">SurName</td><td class="spacer"></td><td class="phone">PhoneNumber</td><td class="spacer"></td><td class="remarks">Remarks</td><td class="spacer"></td><td class="event">Event</td><td class="spacer"></td><td class="date">Date</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    sendContentAsPage(FILE_NAME, { content1: out }, res, true, 'admin');
});

// Create new registration entry
router.post(`/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    let { givenName, surName, phone, remarks, event, dateAsString } = req.body;
    dateAsString = dateAsString || convertToDateAsString(new Date());

    const registration = new Registration({
        givenName: givenName,
        surName: surName,
        phone: phone,
        remarks: remarks,
        event: event,
        dateAsString: dateAsString,
        date: convertToDate(dateAsString)
    });

    try {
        const newRegistration = await registration.save();
        res.status(201).json(newRegistration);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Update registration entry
router.patch(`/${SITE_NAME}/:id`, ensureAuthenticated, getRegistration, async (req, res) => {
    let registration = res.registration;
    const { givenName, surName, phone, remarks, event, dateAsString } = req.body;
    if (givenName) registration.givenName = givenName;
    if (surName) registration.surName = surName;
    if (phone) registration.phone = phone;
    if (remarks) registration.remarks = remarks;
    if (event) registration.event = event;
    if (dateAsString) {
        registration.dateAsString = dateAsString;
        registration.date = convertToDate(dateAsString);
    }

    const updatedRegistration = await registration.save();
    res.json(updatedRegistration);
});

// Delete registration entry
router.delete(`/${SITE_NAME}/:id`, ensureAuthenticated, getRegistration, async (req, res) => {
    await res.registration.remove();
    res.json({ message: 'Deleted registration entry' });
});

async function getRegistration(req, res, next) {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Cannot find registration entry' });

    res.registration = registration;
    next();
}

module.exports = router;
