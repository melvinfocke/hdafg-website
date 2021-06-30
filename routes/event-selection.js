const express = require('express');
const router = express.Router();
const { sendContentAsPage } = require('../functions/templatepage');
const Event = require('../models/event');

router.get('/', async (req, res) => {
    const eventArray = await Event.find({ isVisible: true });
    let pageContent = '<ul>';

    eventArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });

    eventArray.forEach((event) => {
        const dateString = event.dateAsString + (event.dateAsString.split(' ')[1] ? ' Uhr' : '');
        pageContent += `<li><a href="${event._id}">${dateString} - ${event.displayName}</a></li>`;
    });
    pageContent += '</ul>';

    sendContentAsPage('event-selection', pageContent, res, false, 'event-selection');
});

module.exports = router;
