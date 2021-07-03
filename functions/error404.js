const fs = require('fs');
const { ROOT_DIRECTORY } = require('../config');

function send404Page(res) {
    fs.readFile(`${ROOT_DIRECTORY}/templates/error404.html`, (err, data) => {
        /*
        if (err) return res.status(404).json({ error: 'This page does not exist.' });
        let error404PageAsString = data.toLocaleString(); */
        res.redirect('/?404');

        //res.status(404).send(error404PageAsString);
    });
}

module.exports = { send404Page };
