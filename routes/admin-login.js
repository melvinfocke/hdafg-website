const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const Admin = require('../models/admin');
const { ensureAuthenticated } = require('../functions/authentication');
const { sendContentAsPage, sendAdminLoginAsPage } = require('../functions/templatepage');

router.get('/admin', async (req, res) => {
    if (req.isAuthenticated()) return res.redirect(`/admin/dashboard`);

    const loginStatus = Object.keys(req.query)[0];
    const adminArray = await Admin.find();

    if (adminArray.length == 0 && loginStatus == 'createaccount') {
        return sendAdminLoginAsPage(res, 'Bitte erstelle einen neuen Admin Account.');
    }
    if (adminArray.length == 0) return res.redirect('/admin?createaccount');
    if (loginStatus == 'failed') return sendAdminLoginAsPage(res, 'Dein Benutzername oder Passwort ist falsch.');

    sendAdminLoginAsPage(res);
});

router.get(`/admin/dashboard2`, ensureAuthenticated, async (req, res) => {
    const content =
        '<ul><li><a href="/admin/file-explorer">File Explorer</a></li><li><a href="/admin/file-uploader">File Uploader</a></li><li><a href="/admin/events">Events</a></li><li><a href="/admin/registrations">Anmeldungen</a></li><li><a href="/admin/registration-log">Anmeldungslog</a></li><li><a href="/admin/admin-login-log">Admin Login Log</a></li><li><a href="/admin/admins">Admins</a></li><li><a href="/admin/logout">Logout</a></li></ul>';
    sendContentAsPage(`admin-dashboard`, { content1: content }, res, false, 'admin');
});

router.get(`/admin/logout`, (req, res) => {
    const socketId = req.session.socketId;
    req.logout();
    res.cookie('auth', '', { expires: new Date() });
    res.redirect('/admin');
});

router.post(`/admin`, async (req, res, next) => {
    const adminArray = await Admin.find();

    if (adminArray.length == 0) {
        if (req.body.username === '' || req.body.password === '') return res.redirect(`/${SITE_NAME}?createaccount`);

        const admin = new Admin({
            _id: req.body.username.toLowerCase(),
            password: await bcrypt.hash(req.body.password, 10)
        });
        await admin.save();
    }

    passport.authenticate('local', {
        successRedirect: `/admin/dashboard`,
        failureRedirect: `/admin/dashboard`
    })(req, res, next);
});

module.exports = router;
