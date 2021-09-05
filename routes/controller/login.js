const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const Admin = require('../../models/admin');

router.get('/admin', async (req, res) => {
    if (req.isAuthenticated()) return res.redirect(`/admin/dashboard`);

    const loginStatus = Object.keys(req.query)[0];
    const adminArray = await Admin.find();

    if (adminArray.length == 0 && loginStatus == 'createaccount') {
        return res.render('login', { errorMessage: 'Bitte erstelle einen neuen Admin Account.' });
    }
    if (adminArray.length == 0) return res.redirect('/admin?createaccount');
    if (loginStatus == 'failed') {
        return res.render('login', { errorMessage: 'Dein Benutzername oder Passwort ist falsch.' });
    }
    res.render('login', { errorMessage: undefined });
});

router.get(`/logout`, (req, res) => {
    req.logout();
    res.cookie('auth', '', { expires: new Date() });
    res.redirect('/admin');
});

router.post(`/admin`, async (req, res, next) => {
    const adminArray = await Admin.find();

    if (adminArray.length == 0) {
        if (req.body.username === '' || req.body.password === '') return res.redirect('/admin?createaccount');

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
