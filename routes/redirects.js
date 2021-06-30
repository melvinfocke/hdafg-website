const express = require('express');
const router = express.Router();
const { send404Page } = require('../functions/error404');

// Redirect to Discord Server
/*
router.get('/discord', (req, res) => {
    if (DISCORD_URL) return res.redirect(DISCORD_URL);
    send404Page(res);
});
*/

// Auto redirect after time duration
router.get('/redirect', (req, res) => {
    const time = req.query.t || 5;
    const responseCodeRaw = req.query.r || 200;
    const message = req.query.m || `Please wait ${time} seconds`;
    const url = req.query.url || '/';

    let responseCode = 200;
    if (responseCodeRaw >= 100 && responseCodeRaw <= 599) responseCode = responseCodeRaw;

    res.status(responseCode).send(
        `
<html lang="en">
    <head>
        <title>VARO - Redirect</title>
        <style>
            :root {
                --background-color: #f4f6f8;
                --font-color: #5a5a5a;
            }
            @media (prefers-color-scheme: dark) {
                :root {
                    --background-color: #0f0f0f;
                    --font-color: #c4c4c4;
                }
            }
            * {
                font-family: Helvetica;
            }
            body {
                background-color: var(--background-color);
                color: var(--font-color);
            }
        </style>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv='refresh' content='${time}; URL=${url}' />
    </head>
    <body>
        <p>${message}</p>
    </body>
</html>
        `
    );
});

module.exports = router;
