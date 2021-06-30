require('dotenv').config();

const ROOT_DIRECTORY = process.env.ROOT_DIRECTORY || __dirname;
const DATABASE = process.env.DATABASE || 'mongodb://localhost/hdafg';
const MAIL_HOST = process.env.MAIL_HOST || 'smtp.gmail.com';
const MAIL_PORT = process.env.MAIL_PORT || 465;
const MAIL_SECURE_CONNECTION = process.env.MAIL_SECURE_CONNECTION || true;
const MAIL_USER = process.env.MAIL_USER || '';
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || '';
const MAIL_TO = process.env.MAIL_TO || '';
//const DOMAIN = process.env.DOMAIN || 'localhost';
const MAX_FAILED_ADMIN_LOGINS_PER_DAY = process.env.MAX_FAILED_ADMIN_LOGINS_PER_DAY || 5;
const MAX_REGISTRATIONS_PER_DAY = process.env.MAX_REGISTRATIONS_PER_DAY || 3;

module.exports = {
    ROOT_DIRECTORY,
    DATABASE,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO,
    //DOMAIN,
    MAX_FAILED_ADMIN_LOGINS_PER_DAY,
    MAX_REGISTRATIONS_PER_DAY
};
