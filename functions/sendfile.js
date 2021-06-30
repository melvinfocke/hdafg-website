const fs = require('fs');
const { ROOT_DIRECTORY } = require('../config');
const { send404Page } = require('../functions/error404');

function sendFile(res, file) {
    file = file || '';

    if (file.endsWith('.css')) {
        fs.readFile(`${ROOT_DIRECTORY}/styles/${file}`, (err, data) => {
            if (err) return send404Page(res);
            return res.status(200).sendFile(`${ROOT_DIRECTORY}/styles/${file}`);
        });
    } else if (file.endsWith('.js')) {
        fs.readFile(`${ROOT_DIRECTORY}/scripts/${file}`, (err, data) => {
            if (err) return send404Page(res);
            return res.status(200).sendFile(`${ROOT_DIRECTORY}/scripts/${file}`);
        });
    } else if (file.endsWith('.png')) {
        fs.readFile(`${ROOT_DIRECTORY}/images/${file}`, (err, data) => {
            if (err) return send404Page(res);
            return res.status(200).sendFile(`${ROOT_DIRECTORY}/images/${file}`);
        });
    } else {
        send404Page(res);
    }
}

module.exports = { sendFile };
