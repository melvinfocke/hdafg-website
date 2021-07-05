/* SOURCE: https://github.com/beforesemicolon/Projects/blob/development/multifile-uploader/server.js */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const { promisify } = require('util');
const Busboy = require('busboy');
const { sendContentAsPage } = require('../functions/templatepage');
const {
    MAX_UPLOAD_DIRECTORY_SIZE,
    MAX_UPLOAD_FILE_SIZE,
    ROOT_DIRECTORY,
    UPLOAD_DIRECTORY,
    DISALLOWED_FILE_NAMES_FOR_UPLOAD
} = require('../config');
const { getTotalSize } = require('../functions/uploader');

const getFileDetails = promisify(fs.stat);

const getFilePath = (fileName) => `${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}/${fileName}`;

router.post('/admin/file-uploader-request', (req, res) => {
    if (!req.body || !req.body.fileName) {
        res.status(400).json({ message: 'Missing "fileName"' });
    } else {
        const fileName = req.body.fileName;

        if (DISALLOWED_FILE_NAMES_FOR_UPLOAD?.split(',')?.includes(fileName)) {
            return res.status(400).json({ message: 'Disallowed fileName' });
        }

        fs.createWriteStream(getFilePath(req.body.fileName), { flags: 'w' });
        res.status(200).json({ fileName: req.body.fileName });
    }
});

router.get('/admin/file-uploader-status', (req, res) => {
    if (req.query && req.query.fileName && req.query.fileId) {
        getFileDetails(getFilePath(req.query.fileName))
            .then((stats) => {
                res.status(200).json({ totalChunkUploaded: stats.size });
            })
            .catch((err) => {
                console.error('failed to read file', err);
                res.status(400).json({ message: 'No file with such credentials', credentials: req.query });
            });
    }
});

router.get('/admin/file-uploader', async (req, res) => {
    if (isDirectroyFull() === true) return res.status(500).json({ message: 'Upload directory is full' });

    sendContentAsPage('admin-file-uploader', '', res, true, 'admin-file-uploader');
});

router.post('/admin/file-uploader', (req, res) => {
    const contentRange = req.headers['content-range'];
    const fileName = req.headers['x-file-name'];

    if (!contentRange) {
        return res.status(400).json({ message: 'Missing "Content-Range" header' });
    }

    if (!fileName) {
        return res.status(400).json({ message: 'Missing "X-File-Name" header' });
    }

    const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);

    if (!match) {
        return res.status(400).json({ message: 'Invalid "Content-Range" Format' });
    }

    const rangeStart = Number(match[1]);
    const rangeEnd = Number(match[2]);
    const fileSize = Number(match[3]);

    if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
        return res.status(400).json({ message: 'Invalid "Content-Range" provided' });
    }

    if (isDirectroyFull(fileSize) === true) {
        return res.status(500).json({ message: 'Upload directory is full' });
    }
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', (_, file, fileName) => {
        /*
		file.on('limit', (data) => {
			req.unpipe();
			req.socket.end();
			res.end();
			return res.status(400).json({ message: 'limit has been reached' });
		});*/
        if (fileSize >= MAX_UPLOAD_FILE_SIZE) {
            req.unpipe();
            req.socket.end();
            res.end();
            //file.resume();
            return res.status(400).json({ message: 'File is too large' });
        }

        const filePath = getFilePath(fileName);
        if (!fileName) {
            req.pause();
        }

        getFileDetails(filePath)
            .then((stats) => {
                if (stats.size !== rangeStart) {
                    return res.status(400).json({ message: 'Bad "chunk" provided' });
                }

                file.pipe(fs.createWriteStream(filePath, { flags: 'a' })).on('error', (e) => {
                    console.error('failed upload', e);
                    res.sendStatus(500);
                });
            })
            .catch((err) => {
                res.status(400).json({ message: 'No file with such credentials', credentials: req.query });
            });
    });

    busboy.on('error', (e) => {
        console.error('failed upload', e);
        res.sendStatus(500);
    });

    busboy.on('finish', () => {
        res.sendStatus(200);
    });

    req.pipe(busboy);
});

function isDirectroyFull(currentFileSize = 0) {
    const size = getTotalSize(`${ROOT_DIRECTORY}/${UPLOAD_DIRECTORY}`);
    return size + currentFileSize >= MAX_UPLOAD_DIRECTORY_SIZE;
}

module.exports = router;
