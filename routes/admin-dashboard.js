const express = require('express');
const router = express.Router();
const { sendContentAsPage } = require('../functions/templatepage');
const Event = require('../models/event');
const Registration = require('../models/registration');
const nodemailer = require('nodemailer');
const { sendFile } = require('../functions/sendfile');
const { autoRedirect } = require('../functions/redirect');
const { ensureCanRegistrate } = require('../functions/authentication');
const { convertToDate, convertToDateAsString } = require('../functions/date');
const {
    DOMAIN,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO
} = require('../config');

router.get('/admin/dashboard2', async (req, res) => {
    sendContentAsPage('admin-dashboard', {}, res, false, 'admin-dashboard');
});

module.exports = router;
