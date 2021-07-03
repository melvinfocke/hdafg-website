const express = require('express');
const router = express.Router();
const { sendContentAsPage } = require('../functions/templatepage');
const Event = require('../models/event');
const Registration = require('../models/registration');
const nodemailer = require('nodemailer');
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

router.get('/', async (req, res) => {
    let alertObj = null;
    const key = Object.keys(req.query)[0];
    if (key == '404') {
        alertObj = {
            hl: '404',
            p: `Diese Seite konnte leider nicht gefunden werden.`,
            img: `/welcome-img.png`
        };
    }

    /* * DISPLAY EVENTS * */
    const eventArray = await Event.find({ isVisible: true });
    let pageContent = '';

    eventArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });

    eventArray.forEach((event) => {
        const fullDateString = event.dateAsString + (event.dateAsString.split(' ')[1] ? ' Uhr' : '');
        const dateString = fullDateString.split(' ')[0];
        const timeString = fullDateString.split(' ')[1];
        pageContent += `
                <div class="event-div">
                    <image src="/${event._id}.png" alt="${event.displayName} Foto"></image>
                    <h4>${event.displayName}</h4>
                    <p>
                        <strong>${fullDateString}</strong><br>Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
                    </p>
                    <!--<a href="/${event._id}">Jetzt anmelden</a>-->
                    <button onclick="showModal('${event._id}', '${event.displayName}', '${dateString}', '${timeString}')">Jetzt anmelden</button>
                </div>`;
    });

    sendContentAsPage('index', pageContent, res, false, 'index', alertObj);
});

router.post('/', ensureCanRegistrate, async (req, res) => {});

module.exports = router;
