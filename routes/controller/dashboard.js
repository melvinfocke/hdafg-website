const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../functions/controller/authentication');

router.get('/admin/dashboard', ensureAuthenticated, async (req, res) => {
    res.render('dashboard');
});

router.get(`/admin/legacy-dashboard`, ensureAuthenticated, async (req, res) => {
    const content =
        '<ul><li><a href="/admin/file-explorer">File Explorer</a></li><li><a href="/admin/file-uploader">File Uploader</a></li><li><a href="/admin/events">Events</a></li><li><a href="/admin/registrations">Anmeldungen</a></li><li><a href="/admin/registration-log">Anmeldungslog</a></li><li><a href="/admin/admin-login-log">Admin Login Log</a></li><li><a href="/admin/admins">Admins</a></li><li><a href="/logout">Logout</a></li></ul>';
    res.render('legacy-admin', { content, script: undefined });
});

module.exports = router;
