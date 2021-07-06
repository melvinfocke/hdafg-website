const Event = require('./models/event');
const Registration = require('./models/registration');
const nodemailer = require('nodemailer');
const { ensureCanRegistrate } = require('./functions/authentication');
const { convertToDate, convertToDateAsString } = require('./functions/date');
const {
    DOMAIN,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO,
    MAX_REGISTRATIONS_PER_DAY
} = require('./config');

module.exports = function (io) {
    io.sockets.on('connection', (socket) => {
        socket.on('sendForm', async (data) => {
            const ip = socket.request.connection.remoteAddress;

            if ((await ensureCanRegistrate(ip)) == false) {
                socket.emit('sendFormResult', {
                    status: 'fehlgeschlagen',
                    message: `Du hast zu viele Anmeldeversuche getätigt. Es sind nur maximal ${MAX_REGISTRATIONS_PER_DAY} Anmeldungen pro Tag pro IP-Adresse möglich.`
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

            const event = await Event.findById(eventId);
            if (!event) return;

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
                        let status = hasFailed == true ? 'fehlgeschlagen' : 'erfolgreich';
                        let message =
                            hasFailed == true
                                ? `Vielen Dank fürs Anmelden, doch leider konnte deine Anmeldung für <strong>${event.displayName}</strong> aufgrund eines Serverfehlers nicht erfolgreich übermittelt werden. Bitte versuche es in einigen Stunden erneut oder melde dich bei <a class="link" href="mailto:info.hdafg@gmail.com">info.hdafg@gmail.com</a>, falls das Problem bestehen bleiben sollte. Wir bitten diese Unannehmlichkeiten zu entschuldigen.`
                                : `Vielen Dank fürs Anmelden! <br>Deine Anmeldung für <strong>${event.displayName}</strong> wurde erfolgreich übermittelt. Sie ist jedoch <strong>nicht</strong> die Zusage zum Event kommen zu dürfen. Die endgültige Zusage und Daten wie Uhrzeit, Adresse und was mitgebracht werden soll werden dir innerhalb von 24 Stunden per WhatsApp mitgeteilt.`;
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
