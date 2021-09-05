const express = require('express');
const router = express.Router();
const { CONTROLLER_URL } = require('../../config');
const { send404Page } = require('../../functions/error404');

// REDIRECT TO HDAFG.DE
router.get('/admin', (req, res) => {
    if (CONTROLLER_URL) return res.redirect(CONTROLLER_URL);
    send404Page(res);
});

module.exports = router;
