const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../functions/controller/authentication');
const { convertToDate } = require('../../functions/date');
const Event = require('../../models/event');

const SITE_NAME = 'events';

// Get events dashboard
router.get(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const eventArray = await Event.find();

    let out = '';
    let out0 = '';
    eventArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });

    out0 += `<tr class="hoverable" id="newRow" style="display: none;"><td class="id editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="displayname editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="city editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="date editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="description editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="isvisible editable" contenteditable="true"><span></span></td><td class="editButton editButtonApply" onclick="addbutton('A');"><span>A</span></td><td class="deleteButton" onclick="addbutton('X');"><span>X</span></td></tr>`;

    eventArray.forEach((event) => {
        out0 += `<tr class="hoverable" id="${event._id}"><td class="id"><span>${event._id}</span></td><td class="spacer"></td><td class="displayname"><span>${event.displayName}</span></td><td class="spacer"></td><td class="city"><span>${event.city}</span></td><td class="spacer"></td><td class="date"><span>${event.dateAsString}</span></td><td class="spacer"></td><td class="description"><span>${event.description}</span></td><td class="spacer"></td><td class="isvisible"><span>${event.isVisible}</span></td><td class="editButton" onclick="editbutton('${event._id}');"><span>E</span></td><td class="deleteButton" onclick="deletebutton('${event._id}');"><span>X</span></td></tr>`;
    });

    out = `<table><thead><tr><td class="id">ID</td><td class="spacer"></td><td class="displayname">DisplayName</td><td class="spacer"></td><td class="city">City</td><td class="spacer"></td><td class="date">Date</td><td class="spacer"></td><td class="description">Description</td><td class="spacer"></td><td class="isvisible">IsVisible</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    res.render('legacy-admin', { content: out, script: SITE_NAME });
});

// Create new event entry
router.post(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    let { id, displayName, city, dateAsString, description, isVisible } = req.body;
    dateAsString = dateAsString || '01.01.2000 00:00:00';

    const event = new Event({
        _id: id.toLowerCase().replace(' ', '-'),
        displayName: displayName || id,
        city: city,
        dateAsString: dateAsString,
        date: convertToDate(dateAsString),
        description: description,
        isVisible: isVisible || true
    });

    try {
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

// Update event entry
router.patch(`/admin/${SITE_NAME}/:id`, ensureAuthenticated, getEvent, async (req, res) => {
    let event = res.event;
    const { displayName, city, dateAsString, description, isVisible } = req.body;
    if (displayName) event.displayName = displayName;
    if (city) event.city = city;
    if (description) event.description = description;
    if (isVisible == 'true' || isVisible == 'false') event.isVisible = isVisible;
    if (dateAsString) {
        event.dateAsString = dateAsString;
        event.date = convertToDate(dateAsString);
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});

// Delete event entry
router.delete(`/admin/${SITE_NAME}/:id`, ensureAuthenticated, getEvent, async (req, res) => {
    await res.event.remove();
    res.json({ message: 'Deleted event entry' });
});

async function getEvent(req, res, next) {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Cannot find event entry' });

    res.event = event;
    next();
}

module.exports = router;
