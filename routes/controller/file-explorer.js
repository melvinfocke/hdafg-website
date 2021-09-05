const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../functions/controller/authentication');
const { getAllFiles, getFileSize, deleteFilesWhichStartWith } = require('../../functions/controller/uploader');
const { ROOT_DIRECTORY, UPLOAD_DIRECTORY, DISALLOWED_FILE_NAMES_FOR_UPLOAD } = require('../../config');

const SITE_NAME = 'file-explorer';

// Get file explorer dashboard
router.get(`/admin/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const fileArray = getAllFiles(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}`);

    let out = '';
    let out0 = '';

    fileArray.forEach((file) => {
        let fileName = file?.split('/')?.pop();
        if (DISALLOWED_FILE_NAMES_FOR_UPLOAD?.split(',')?.includes(fileName) === false) {
            let fileSize = getFileSize(`${file}`);
            out0 += `<tr class="hoverable" id="${fileName}"><td class="filename"><span>${fileName}</span></td><td class="spacer"></td><td class="filesize"><span>${fileSize}</span></td><!--<td class="editButton" onclick="editbutton('${fileName}');"><span>E</span></td>--><td class="deleteButton" onclick="deletebutton('${fileName}');"><span>X</span></td></tr>`;
        }
    });

    out = `<table><thead><tr><td class="filename">FileName</td><td class="spacer"></td><td class="filesize">FileSize</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    res.render('legacy-admin', { content: out, script: SITE_NAME });
});

// Delete file
router.delete(`/admin/${SITE_NAME}/:fileName`, ensureAuthenticated, async (req, res) => {
    const fileName = req.params.fileName;

    if (DISALLOWED_FILE_NAMES_FOR_UPLOAD?.split(',')?.includes(fileName) === false) {
        deleteFilesWhichStartWith(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}`, fileName);
    }
    res.json({ message: 'Deleted file' });
});

module.exports = router;
