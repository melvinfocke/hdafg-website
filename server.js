// LOAD CONFIG
const { MODE, CITY, DATABASE, MAINTENANCE_REDIRECT_URL } = require('./config');

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIoPath = (MODE === 'NODE' ? '/' + CITY.toLowerCase() : '') + '/socket.io';
const io = require('socket.io')(server, { cors: { origin: '*' }, path: socketIoPath });
const mongoose = require('mongoose');
const cors = require('cors');
const { send404Page } = require('./functions/error404');
const { sendFile } = require('./functions/sendfile');

// DATABASE
mongoose.connect(DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.on('open', () => console.log('Connected to database'));

// PASSPORT AUTHENTICATION (IF MODE === 'CONTROLLER')
let sessionMiddleware;
let passport;
switch (MODE) {
    case 'CONTROLLER':
        const session = require('express-session');
        passport = require('passport');

        sessionMiddleware = session({
            name: 'auth',
            secret: 'secretForSession',
            resave: false,
            saveUninitialized: false
        });
        app.use(sessionMiddleware);
        app.use(passport.initialize());
        app.use(passport.session());
        require('./functions/controller/passport')(passport);
}

// OTHER EXPRESS SETTINGS
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.set('view engine', 'ejs');

// ROUTES
if (MAINTENANCE_REDIRECT_URL) {
    app.get('*', (req, res) => res.redirect(MAINTENANCE_REDIRECT_URL));
    server.listen(8080, () => console.log(`Listening in maintenance redirect mode`));
    return;
}

switch (MODE) {
    case 'CONTROLLER':
        app.use('/', require('./routes/controller/login'));
        app.use('/', require('./routes/controller/events'));
        app.use('/', require('./routes/controller/registrations'));
        app.use('/', require('./routes/controller/registration-log'));
        app.use('/', require('./routes/controller/admin-login-log'));
        app.use('/', require('./routes/controller/admins'));
        app.use('/', require('./routes/controller/file-uploader'));
        app.use('/', require('./routes/controller/file-explorer'));
        app.use('/', require('./routes/controller/dashboard'));
        app.use('/', require('./routes/controller/list-all-cities'));
        app.use('/', require('./routes/controller/error'));
        break;
    case 'NODE':
        app.use('/', require('./routes/node/index'));
        break;
    default:
        app.get('*', (req, res) => res.status(500).send('Error: MODE needs to be CONTROLLER or NODE'));
}

app.get('/:file', (req, res) => sendFile(res, req.params.file));
app.get('*', (req, res) => send404Page(res));

// SOCKET.IO, SCHEDULER AND SERVERNAME
switch (MODE) {
    case 'CONTROLLER':
        require('./socketio/controller/dashboard')(io, sessionMiddleware, passport);
        require('./functions/controller/scheduler');
        break;
    case 'NODE':
        break;
}

server.listen(8080, () => console.log(`Listening as ${MODE?.toLowerCase()}`));
