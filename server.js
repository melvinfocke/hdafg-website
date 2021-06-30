const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const { DATABASE } = require('./config');
const { send404Page } = require('./functions/error404');
const scheduler = require('./functions/scheduler');

mongoose.connect(DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.on('open', () => console.log('Connected to database'));

// Passport authentication
const passport = require('passport');
const session = require('express-session');
require('./functions/passport')(passport);
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Other express settings
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

app.use('/', require('./routes/admin-login'));
app.use('/', require('./routes/admin-events'));
app.use('/', require('./routes/admin-registrations'));
app.use('/', require('./routes/admin-registration-log'));
app.use('/', require('./routes/admin-admin-login-log'));
app.use('/', require('./routes/admin-admins'));

app.use('/', require('./routes/redirects'));
app.use('/', require('./routes/event-selection'));

app.use('/', require('./routes/event-registration'));
app.get('*', (req, res) => send404Page(res));

scheduler();

app.listen(8080, () => console.log('Listening on port 8080'));
