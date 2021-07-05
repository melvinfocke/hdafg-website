const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../functions/authentication');
const { sendContentAsPage } = require('../functions/templatepage');
const { convertToDate } = require('../functions/date');
const { getAllFiles, getFileSize, deleteFilesWhichStartWith } = require('../functions/uploader');
const { ROOT_DIRECTORY, UPLOAD_DIRECTORY, DISALLOWED_FILE_NAMES_FOR_UPLOAD } = require('../config');

const SITE_NAME = 'admin/file-explorer';
const FILE_NAME = 'admin-file-explorer';

// Get file explorer dashboard
router.get(`/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const fileArray = getAllFiles(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}`);

    let out = '';
    let out0 = '';
    /*fileArray.sort((a, b) => {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
    });
    */

    //out0 += `<tr class="hoverable" id="newRow" style="display: none;"><td class="id editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="displayname editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="date editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="description editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="isvisible editable" contenteditable="true"><span></span></td><td class="editButton editButtonApply" onclick="addbutton('A');"><span>A</span></td><td class="deleteButton" onclick="addbutton('X');"><span>X</span></td></tr>`;

    fileArray.forEach((file) => {
        let fileName = file?.split('/')?.pop();
        if (DISALLOWED_FILE_NAMES_FOR_UPLOAD?.split(',')?.includes(fileName) === false) {
            let fileSize = getFileSize(`${file}`);
            out0 += `<tr class="hoverable" id="${fileName}"><td class="filename"><span>${fileName}</span></td><td class="spacer"></td><td class="filesize"><span>${fileSize}</span></td><!--<td class="editButton" onclick="editbutton('${fileName}');"><span>E</span></td>--><td class="deleteButton" onclick="deletebutton('${fileName}');"><span>X</span></td></tr>`;
        }
    });

    out = `<table><thead><tr><td class="filename">FileName</td><td class="spacer"></td><td class="filesize">FileSize</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    sendContentAsPage(FILE_NAME, { content1: out }, res, true, 'admin');
});

// Create new entry
/*
router.post(`/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    let { id, displayName, dateAsString, description, isVisible } = req.body;
    dateAsString = dateAsString || '01.01.2000 00:00:00';

    const event = new Event({
        _id: id.toLowerCase().replace(' ', '-'),
        displayName: displayName || id,
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
*/

// Update entry
/*
router.patch(`/${SITE_NAME}/:id`, ensureAuthenticated, getEvent, async (req, res) => {
    let event = res.event;
    const { displayName, dateAsString, description, isVisible } = req.body;
    if (displayName) event.displayName = displayName;
    if (description) event.description = description;
    if (isVisible == 'true' || isVisible == 'false') event.isVisible = isVisible;
    if (dateAsString) {
        event.dateAsString = dateAsString;
        event.date = convertToDate(dateAsString);
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});
*/

// Delete file
router.delete(`/${SITE_NAME}/:fileName`, ensureAuthenticated, async (req, res) => {
    const fileName = req.params.fileName;

    if (DISALLOWED_FILE_NAMES_FOR_UPLOAD?.split(',')?.includes(fileName) === false) {
        deleteFilesWhichStartWith(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}`, fileName);
    }
    res.json({ message: 'Deleted file' });
});
/*
async function getEvent(req, res, next) {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Cannot find event entry' });

    res.event = event;
    next();
}
*/

module.exports = router;
