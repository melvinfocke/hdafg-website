const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');

function passport(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            // Match user
            Admin.findById(username.toLowerCase())
                .then((admin) => {
                    if (!admin) return done(null, false, { message: 'Cannot find user' });
                    // Match password
                    bcrypt.compare(password, admin.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) return done(null, admin);
                        return done(null, false, { message: 'Wrong password' });
                    });
                })
                .catch((err) => console.error(err));
        })
    );
    passport.serializeUser((admin, done) => {
        done(null, admin.id);
    });
    passport.deserializeUser((id, done) => {
        Admin.findById(id, (err, admin) => {
            done(err, admin);
        });
    });
}

module.exports = passport;
