const express = require('express');
const router = express.Router();
const Event = require('../../models/event');
const Registration = require('../../models/registration');
const nodemailer = require('nodemailer');
const { ensureCanRegistrate } = require('../../functions/node/authentication');
const { convertToDateAsString } = require('../../functions/date');

// LOAD CONFIG
const {
    CITY,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO,
    MAX_REGISTRATIONS_PER_DAY,
    MAIL_FROM
} = require('../../config');

router.get('/', async (req, res) => {
    /* * DISPLAY EVENTS * */
    const eventArray = await Event.find({ isVisible: true, city: CITY });
    eventArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });

    res.render('index', { city: CITY, upcomingEvents: eventArray, internalCss: getInternalCss(eventArray) });
});

router.post('/', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req?.connection?.remoteAddress;

    if ((await ensureCanRegistrate(ip)) == false) {
        res.send({
            status: 'FEHL&shy;GE&shy;SCHLA&shy;GEN',
            message: `Du hast zu viele An&shy;mel&shy;de&shy;ver&shy;su&shy;che getätigt. Es sind nur ma&shy;xi&shy;mal ${MAX_REGISTRATIONS_PER_DAY} An&shy;mel&shy;dun&shy;gen pro Tag pro IP-Adresse mög&shy;lich.`
        });
        return;
    }

    let { givenName, surName, phone, remarks, eventId } = req.body;

    givenName = truncate(givenName, 26);
    surName = truncate(surName, 26);
    phone = truncate(phone, 24);
    remarks = truncate(remarks, 200);
    eventId = truncate(eventId, 50);

    givenName = givenName?.replace(/\s/g, '') !== '' ? givenName : null;
    surName = surName?.replace(/\s/g, '') !== '' ? surName : null;
    phone = phone?.replace(/\s/g, '') !== '' ? phone : null;
    remarks = remarks?.replace(/\s/g, '') !== '' ? remarks : null;

    if (!(givenName && surName && phone)) return;

    const event = await Event.findOne({ _id: eventId, isVisible: true });
    if (!event) {
        res.send({
            status: 'FEHL&shy;GE&shy;SCHLA&shy;GEN',
            message: `Du kannst dich beim Event nicht an&shy;mel&shy;den, da es be&shy;reits ent&shy;fernt wur&shy;de. Bit&shy;te la&shy;de die Web&shy;site neu, da&shy;mit dir die ak&shy;tu&shy;ells&shy;ten Events an&shy;ge&shy;zeigt wer&shy;den.`
        });
        return;
    }

    const dateNow = new Date();
    const registration = new Registration({
        givenName: givenName,
        surName: surName,
        phone: phone,
        remarks: remarks || 'undefined',
        event: event._id,
        city: CITY,
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

    let hasSent = false;
    let hasFailed = false;
    MAIL_TO.split(',').forEach((mailToEntry) => {
        const receiverInfo = mailToEntry.split(':');

        let mailOptions = {
            from: MAIL_FROM,
            to: receiverInfo[1],
            subject: `${givenName} ${surName} hat sich für ${event.displayName} angemeldet`,
            html: `Hey ${receiverInfo[0]}, <br><br>jemand hat sich am <strong>${dateAndTimeAsStringObj[0]}</strong> um <strong>${dateAndTimeAsStringObj[1]} Uhr</strong> für <strong>${event.displayName}</strong> angemeldet. Hier sind seine/ihre Kontaktdaten: <br><br>Name: <strong>${givenName} ${surName}</strong> <br>Telefon: <strong><a href="tel:${phone}">${phone}</a></strong>${remarksString} <br><br>Mit freundlichen Grüßen <br><i>h.d.a.fg System</i><br><br><small>Mail ID: ${newRegistration._id}</small>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                hasFailed = true;
            }

            if (hasSent == false) {
                let status = hasFailed == true ? 'FEHL&shy;GE&shy;SCHLA&shy;GEN' : 'ER&shy;FOLG&shy;REICH';
                let message =
                    hasFailed == true
                        ? `Vie&shy;len Dank fürs An&shy;mel&shy;den, doch lei&shy;der konn&shy;te dei&shy;ne An&shy;mel&shy;dung für <strong>${event.displayName}</strong> auf&shy;grund ei&shy;nes Ser&shy;ver&shy;feh&shy;lers nicht er&shy;folg&shy;reich über&shy;mit&shy;telt wer&shy;den. Bit&shy;te ver&shy;su&shy;che es in ei&shy;ni&shy;gen Stun&shy;den erneut oder mel&shy;de dich bei <a class="link" href="mailto:info@hdafg.de">info@hdafg.de</a>, falls das Pro&shy;blem be&shy;ste&shy;hen blei&shy;ben soll&shy;te. Wir bit&shy;ten die&shy;se Un&shy;an&shy;nehm&shy;lich&shy;kei&shy;ten zu ent&shy;schul&shy;di&shy;gen.`
                        : `Vie&shy;len Dank fürs An&shy;mel&shy;den! <br>Dei&shy;ne An&shy;mel&shy;dung für <strong>${event.displayName}</strong> wurde er&shy;folg&shy;reich über&shy;mit&shy;telt. Sie ist je&shy;doch <strong>nicht</strong> die Zu&shy;sage zum Event kom&shy;men zu dür&shy;fen. Die end&shy;gül&shy;ti&shy;ge Zu&shy;sa&shy;ge und Daten wie Uhr&shy;zeit, Adres&shy;se und was mit&shy;ge&shy;bracht wer&shy;den soll wer&shy;den dir in&shy;ner&shy;halb von 24 Stun&shy;den per WhatsApp mit&shy;ge&shy;teilt.`;
                res.send({ status: status, message: message });
                hasSent = true;
            }
        });
    });
});

function getInternalCss(eventArray) {
    let internalCss = '<style>';

    eventArray.forEach((event) => {
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

    internalCss += internalCss === '<style>' ? '.events-container { display: none; }' : '';
    internalCss += '</style>';

    return internalCss;
}

function truncate(str, n) {
    return str?.length > n ? str?.substr(0, n - 1) /*+ '&hellip;'*/ : str;
}

module.exports = router;
