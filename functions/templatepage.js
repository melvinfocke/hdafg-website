const { ROOT_DIRECTORY } = require('../config');
const { send404Page } = require('./error404');
const fs = require('fs');

function sendContentAsPage(siteName, content, res, loadScript = false, templateName) {
    fs.readFile(`${ROOT_DIRECTORY}/templates/${templateName}.html`, (err, data) => {
        if (err) return send404Page(res);
        let templatePageAsString = data.toLocaleString();

        templatePageAsString = templatePageAsString.replace('{STYLE}', siteName);
        templatePageAsString = templatePageAsString.replace('{CONTENT}', content);
        if (loadScript == true) {
            templatePageAsString = templatePageAsString.replace('{SCRIPT}', `${siteName}`);
        } else {
            templatePageAsString = templatePageAsString.replace(
                '        <script src="/{SCRIPT}.js" defer></script>',
                ''
            );
        }
        res.send(templatePageAsString);
    });
}

function sendAdminLoginAsPage(res, errorMessage = '') {
    fs.readFile(`${ROOT_DIRECTORY}/templates/admin-login.html`, (err, data) => {
        if (err) return send404Page(res);

        let templatePageAsString = data.toLocaleString();

        if (errorMessage) {
            templatePageAsString = templatePageAsString.replace(
                '<div id="errorBox"></div>',
                `<div id="errorBox"><span>${errorMessage}</div>`
            );
        }
        res.send(templatePageAsString);
    });
}

module.exports = { sendContentAsPage, sendAdminLoginAsPage };
