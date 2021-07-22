const Event = require('../models/event');
const Registration = require('../models/registration');
const nodemailer = require('nodemailer');
const { ensureCanRegistrate } = require('../functions/authentication');
const { convertToDateAsString } = require('../functions/date');
const {
    DOMAIN,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO,
    MAX_REGISTRATIONS_PER_DAY
} = require('../config');

module.exports = function (io) {
    io.of('/').on('connection', (socket) => {
        //console.log('Test | Start page');
        socket.on('sendForm', async (data) => {
            //console.log('v01: ' + socket?.request?.connection?.remoteAddress);
            //console.log('v02: ' + socket?.handshake?.address);
            //console.log('v03: ' + socket?.conn?.transport?.socket?._socket?.remoteAddress);
            //console.log('v04: ' + socket?.handshake?.headers?.host);
            //console.log('v05: ' + socket?.conn?.remoteAddress);
            //console.log('v06: ' + socket?.handshake?.headers['x-real-ip']);
            //let endpoint = socket?.manager?.handshaken[socket?.id]?.address;
            //console.log('v6: ' + endpoint?.address);
            //console.log('v07: ' + socket?.handshake?.address?.address);
            //console.log('v08: ' + socket?.handshake?.headers['x-client-ip']);
            //console.log('v09: ' + socket?.handshake?.headers['x-forwarded-for']);
            //console.log('v10: ' + socket?.handshake?.headers['x-forwarded-by']);

            const ip = socket?.handshake?.headers['x-forwarded-for'] || socket?.request?.connection?.remoteAddress;

            if ((await ensureCanRegistrate(ip)) == false) {
                socket.emit('sendFormResult', {
                    status: 'FEHL&shy;GE&shy;SCHLA&shy;GEN',
                    message: `Du hast zu viele An&shy;mel&shy;de&shy;ver&shy;su&shy;che getätigt. Es sind nur ma&shy;xi&shy;mal ${MAX_REGISTRATIONS_PER_DAY} An&shy;mel&shy;dun&shy;gen pro Tag pro IP-Adresse mög&shy;lich.`
                });
                return;
            }

            let { givenName, surName, phone, remarks, eventId } = data;

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
                socket.emit('sendFormResult', {
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
                    from: MAIL_USER,
                    to: receiverInfo[1],
                    subject: `Neue Anmeldung bei ${DOMAIN}`,
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
                                ? `Vie&shy;len Dank fürs An&shy;mel&shy;den, doch lei&shy;der konn&shy;te dei&shy;ne An&shy;mel&shy;dung für <strong>${event.displayName}</strong> auf&shy;grund ei&shy;nes Ser&shy;ver&shy;feh&shy;lers nicht er&shy;folg&shy;reich über&shy;mit&shy;telt wer&shy;den. Bit&shy;te ver&shy;su&shy;che es in ei&shy;ni&shy;gen Stun&shy;den erneut oder mel&shy;de dich bei <a class="link" href="mailto:info.hdafg@gmail.com">info.hdafg@gmail.com</a>, falls das Pro&shy;blem be&shy;ste&shy;hen blei&shy;ben soll&shy;te. Wir bit&shy;ten die&shy;se Un&shy;an&shy;nehm&shy;lich&shy;kei&shy;ten zu ent&shy;schul&shy;di&shy;gen.`
                                : `Vie&shy;len Dank fürs An&shy;mel&shy;den! <br>Dei&shy;ne An&shy;mel&shy;dung für <strong>${event.displayName}</strong> wurde er&shy;folg&shy;reich über&shy;mit&shy;telt. Sie ist je&shy;doch <strong>nicht</strong> die Zu&shy;sage zum Event kom&shy;men zu dür&shy;fen. Die end&shy;gül&shy;ti&shy;ge Zu&shy;sa&shy;ge und Daten wie Uhr&shy;zeit, Adres&shy;se und was mit&shy;ge&shy;bracht wer&shy;den soll wer&shy;den dir in&shy;ner&shy;halb von 24 Stun&shy;den per WhatsApp mit&shy;ge&shy;teilt.`;
                        socket.emit('sendFormResult', { status: status, message: message });
                        hasSent = true;
                    }
                });
            });
        });
    });
};

function truncate(str, n) {
    return str?.length > n ? str?.substr(0, n - 1) /*+ '&hellip;'*/ : str;
}
