const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { sendContentAsPage } = require('../functions/templatepage');
const { sendFile } = require('../functions/sendfile');
const { autoRedirect } = require('../functions/redirect');
const { ensureCanRegistrate } = require('../functions/authentication');
const { convertToDate, convertToDateAsString } = require('../functions/date');
const {
    DOMAIN,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO
} = require('../config');
const Event = require('../models/event');
const Registration = require('../models/registration');

router.get('/:event', async (req, res) => {
    const paramEvent = req.params.event;
    const event = await Event.findById(paramEvent);

    if (!event) return sendFile(res, paramEvent);
    sendContentAsPage('event-registration', event.displayName, res, false, 'event-registration');
});

router.get('/:event/gesendet', async (req, res) => {
    const paramEvent = req.params.event;
    const event = await Event.findById(paramEvent);

    if (!event) return sendFile(res, paramEvent);
    sendContentAsPage('event-registration-success', event.displayName, res, false, 'event-registration-success');
});

router.get('/:event/fehlgeschlagen', async (req, res) => {
    const paramEvent = req.params.event;
    const event = await Event.findById(paramEvent);

    if (!event) return sendFile(res, paramEvent);
    autoRedirect(res, {
        time: 10,
        responseCode: 500,
        message: `Die Anmeldung konnte aufgrund eines Serverfehlers nicht empfangen werden. Bitte versuche es später noch mal. Du wirst in 10 Sekunden zur Anmeldeseite von ${event.displayName} weitergeleitet.`,
        url: `/${paramEvent}`
    });
});

router.post('/:event', ensureCanRegistrate, async (req, res) => {
    let { givenname: givenName, surname: surName, phone: phoneNumber, remarks: remarks } = req.body;
    const paramEvent = req.params.event;
    remarks = remarks?.replace(/\s/g, '') !== '' ? remarks : null;

    const event = await Event.findById(paramEvent);
    if (!event) return res.status(404).send('Could not find event entry');

    const dateNow = new Date();
    const registration = new Registration({
        givenName: givenName,
        surName: surName,
        phone: phoneNumber,
        remarks: remarks || 'undefined',
        dateAsString: convertToDateAsString(dateNow),
        date: dateNow.getTime()
    });

    let newRegistration;
    try {
        newRegistration = await registration.save();
    } catch (err) {
        console.log({ error: err.message });
    }

    const dateAndTimeAsStringObj = registration.dateAsString.split(' ');
    const remarksString =
        registration.remarks == 'undefined' ? '' : ' <br><br>Bemerkungen: <strong>' + remarks + '</strong>';

    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secureConnection: MAIL_SECURE_CONNECTION,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASSWORD
        }
    });

    let hasFailed = false;
    MAIL_TO.split(',').forEach((mailToEntry) => {
        const receiverInfo = mailToEntry.split(':');

        let mailOptions = {
            from: MAIL_USER,
            to: receiverInfo[1],
            subject: `Neue Anmeldung bei ${DOMAIN}`,
            html: `Hey ${receiverInfo[0]}, <br><br>jemand hat sich am <strong>${dateAndTimeAsStringObj[0]}</strong> um <strong>${dateAndTimeAsStringObj[1]} Uhr</strong> für <strong>${event.displayName}</strong> angemeldet. Hier sind seine/ihre Kontaktdaten: <br><br>Name: <strong>${givenName} ${surName}</strong> <br>Telefon: <strong><a href="tel:${phoneNumber}">${phoneNumber}</a></strong>${remarksString} <br><br>Mit freundlichen Grüßen <br><i>h.d.a.fg System</i><br><br><small>Mail ID: ${newRegistration._id}</small>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                hasFailed = true;
            }
        });
    });

    if (hasFailed == true) return res.redirect(`/${paramEvent}/fehlgeschlagen`);
    res.redirect(`/${paramEvent}/gesendet`);
});

module.exports = router;
