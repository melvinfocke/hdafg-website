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
    let eventItemsAsHtml = '';
    let internalCss = '';

    eventArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });

    eventArray.forEach((event) => {
        const fullDateString = event.dateAsString + (event.dateAsString.split(' ')[1] ? ' Uhr' : '');
        const dateString = fullDateString.split(' ')[0];
        const timeString = fullDateString.split(' ')[1];
        eventItemsAsHtml += `
                <div class="event-div">
                    <div id ="${event._id}-photo-1" class="event-photo"></div>
                    <h4>${event.displayName}</h4>
                    <p>
                        <strong>${fullDateString}</strong><br>${event.description}
                    </p>
                    <!--<a href="/${event._id}">Jetzt anmelden</a>-->
                    <button onclick="showModal('${event._id}', '${event.displayName}', '${dateString}', '${timeString}')">Jetzt anmelden</button>
                </div>`;
        internalCss += `
.no-webp #${event._id}-photo-1 {
    background-image: url('/${event._id}-512-288.png');
    background-image: -webkit-image-set(
        url('/${event._id}-256-144.png') 1x,
        url('/${event._id}-512-288.png') 2x
    );
    background-image: image-set('/${event._id}-256-144.png' 1x, '/${event._id}-512-288.png' 2x);
}
.webp #${event._id}-photo-1 {
    background-image: url('/${event._id}-512-288.webp');
    background-image: -webkit-image-set(
        url('/${event._id}-256-144.webp') 1x,
        url('/${event._id}-512-288.webp') 2x
    );
    background-image: image-set('/${event._id}-256-144.webp' 1x, '/${event._id}-512-288.webp' 2x);
}
@media only screen and (min-width: 563px) {
    .no-webp #${event._id}-photo-2 {
        background-image: url('/${event._id}-512-288.png');
        background-image: -webkit-image-set(
            url('/${event._id}-400-525.png') 1x,
            url('/${event._id}-800-1050.png') 2x
        );
        background-image: image-set('/${event._id}-400-525.png' 1x, '/${event._id}-800-1050.png' 2x);
    }
    .webp #${event._id}-photo-2 {
        background-image: url('/${event._id}-512-288.webp');
        background-image: -webkit-image-set(
            url('/${event._id}-400-525.webp') 1x,
            url('/${event._id}-800-1050.webp') 2x
        );
        background-image: image-set('/${event._id}-400-525.webp' 1x, '/${event._id}-800-1050.webp' 2x);
    }
}`;
    });

    if (!internalCss) internalCss = '.events-container { display: none; }';

    const content1 = eventItemsAsHtml
        ? 'Hier könnt ihr euch anmelden und Teil des Ganzen werden.'
        : 'Es gibt derzeit keine anstehenden Events. Bitte schau in ein paar Tagen erneut vorbei.';

    sendContentAsPage(
        'index',
        { internalCss: internalCss, content1: content1, content2: eventItemsAsHtml },
        res,
        false,
        'index',
        alertObj
    );
});

router.post('/', ensureCanRegistrate, async (req, res) => {});

module.exports = router;
