const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../functions/authentication');
const { sendContentAsPage } = require('../functions/templatepage');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

const SITE_NAME = 'admin/admins';
const FILE_NAME = 'admin-admins';

// Get admins dashboard
router.get(`/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    res.append('Access-Control-Allow-Origin', '*');

    const adminArray = await Admin.find();

    let out = '';
    let out0 = '';
    adminArray.sort((a, b) => {
        return a._id.toLowerCase().localeCompare(b._id.toLowerCase());
    });

    out0 += `<tr class="hoverable" id="newRow" style="display: none;"><td class="id editable" contenteditable="true"><span></span></td><td class="spacer"></td><td class="password editable" contenteditable="true"><span></span></td><td class="editButton editButtonApply" onclick="addbutton('A');"><span>A</span></td><td class="deleteButton" onclick="addbutton('X');"><span>X</span></td></tr>`;

    adminArray.forEach((admin) => {
        out0 += `<tr class="hoverable" id="${admin._id}"><td class="id"><span>${admin._id}</span></td><td class="spacer"></td><td class="password"><span>********</span></td><td class="editButton" onclick="editbutton('${admin._id}');"><span>E</span></td><td class="deleteButton" onclick="deletebutton('${admin._id}');"><span>X</span></td></tr>`;
    });

    out = `<table><thead><tr><td class="id">ID</td><td class="spacer"></td><td class="password">Password</td><td class="addButton" onclick="addbutton();" width="42.98px"><span>Add</span></td></tr></thead><tbody>${out0}</tbody></table>`;

    sendContentAsPage(FILE_NAME, out, res, true, 'admin');
});

// Create new admin account
router.post(`/${SITE_NAME}`, ensureAuthenticated, async (req, res) => {
    const { id, password } = req.body;
    const admin = new Admin({
        _id: id.toLowerCase() || 'admin',
        password: await bcrypt.hash(password || 'admin', 10)
    });

    try {
        const newAdmin = await admin.save();
        res.status(201).json(newAdmin);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
});

// Update admin account
router.patch(`/${SITE_NAME}/:id`, ensureAuthenticated, getAdmin, async (req, res) => {
    let admin = res.admin;
    const { password } = req.body;
    if (password) admin.password = await bcrypt.hash(password, 10);

    const updatedAdmin = await admin.save();
    res.json(updatedAdmin);
});

// Delete admin account
router.delete(`/${SITE_NAME}/:id`, ensureAuthenticated, getAdmin, async (req, res) => {
    await res.admin.remove();
    res.json({ message: 'Deleted admin' });
});

async function getAdmin(req, res, next) {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Cannot find admin' });

    res.admin = admin;
    next();
}

module.exports = router;
