const express = require('express');
const router = express.Router();
const { sendContentAsPage } = require('../functions/templatepage');
const Event = require('../models/event');

router.get('/', async (req, res) => {
    const eventArray = await Event.find({ isVisible: true });
    let pageContent = '';

    eventArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });

    eventArray.forEach((event) => {
        const dateString = event.dateAsString + (event.dateAsString.split(' ')[1] ? ' Uhr' : '');
        /* pageContent += `<li><a href="${event._id}">${dateString} - ${event.displayName}</a></li>`; */
        pageContent += `
                <div class="event-div">
                    <image src="/${event._id}.png" alt="${event.displayName} Foto"></image>
                    <h4>${event.displayName}</h4>
                    <p>
                        <strong>${dateString}</strong><br>Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
                    </p>
                    <a href="/${event._id}">Jetzt anmelden</a>
                </div>`;
    });

    sendContentAsPage('event-selection', pageContent, res, false, 'event-selection');
});

module.exports = router;
