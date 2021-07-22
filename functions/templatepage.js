const { ROOT_DIRECTORY } = require('../config');
const { send404Page } = require('./error404');
const fs = require('fs');

function sendContentAsPage(siteName, content, res, loadScript = false, templateName, alertObj = null) {
    fs.readFile(`${ROOT_DIRECTORY}/templates/${templateName}.html`, (err, data) => {
        if (err) return send404Page(res);
        let templatePageAsString = data.toLocaleString();

        templatePageAsString = templatePageAsString.replace('{STYLE}', siteName);

        if (content.content1 || content.content1 == '') {
            templatePageAsString = templatePageAsString.replace('{CONTENT1}', content.content1);
        }
        if (content.content2 || content.content2 == '') {
            templatePageAsString = templatePageAsString.replace('{CONTENT2}', content.content2);
        }
        if (content.internalCss) {
            templatePageAsString = templatePageAsString.replace('/*{INTERNALCSS}*/', content.internalCss);
        }
        if (loadScript == true) {
            templatePageAsString = templatePageAsString.replace('{SCRIPT}', `${siteName}`);
        } else {
            templatePageAsString = templatePageAsString.replace(
                '        <script src="/{SCRIPT}.js" defer></script>',
                ''
            );
        }
        if (templateName == 'index' && alertObj !== null) {
            templatePageAsString = templatePageAsString.replace(
                '<div id="alert" class="modal" style="display: none">',
                '<div id="alert" class="modal" style="display: block">'
            );
            templatePageAsString = templatePageAsString.replace(
                '<link rel="stylesheet" href="/style.css" />',
                '<link rel="stylesheet" href="/style.css" /><link rel="stylesheet" href="/style-modal-open.css" />'
            );
            templatePageAsString = templatePageAsString.replace(
                '<image id="alert-img" src="" alt="" />',
                `<image id="alert-img" src="${alertObj.img}" alt="${alertObj.img}" />`
            );
            templatePageAsString = templatePageAsString.replace(
                '<h2 id="alert-hl"></h2>',
                `<h2 id="alert-hl">${alertObj.hl}</h2>`
            );
            templatePageAsString = templatePageAsString.replace(
                '<p id="alert-p"></p>',
                `<p id="alert-p">${alertObj.p}</p>`
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
