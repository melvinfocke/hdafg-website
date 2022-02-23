const express = require('express');
const router = express.Router();
const { DOMAIN } = require('../../config');

router.get('/admin/401', (req, res) => {
    req.logout();
    res.status(401).render('error', {
        city: undefined,
        status: 401,
        time: 10,
        url: '/admin?failed',
        message: `Au&shy;then&shy;ti&shy;fi&shy;zie&shy;rung fehl&shy;ge&shy;schla&shy;gen. Bit&shy;te war&shy;te 10 Se&shy;kun&shy;den.`
    });
});

module.exports = router;
