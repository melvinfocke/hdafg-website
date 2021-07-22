const express = require('express');
const router = express.Router();
const { sendContentAsPage } = require('../functions/templatepage');
const { ensureAuthenticated } = require('../functions/authentication');

router.get('/admin/dashboard', ensureAuthenticated, async (req, res) => {
    sendContentAsPage('admin-dashboard', {}, res, false, 'admin-dashboard');
});

module.exports = router;
