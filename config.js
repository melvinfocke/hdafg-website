/*
require('dotenv').config();

const MODE = process.env.MODE || 'NODE'; // Select one: [CONTROLLER, NODE]
const CITY = process.env.CITY || 'NO-CITY';
const ALL_CITIES = process.env.ALL_CITIES || 'NO-CITY';
const ROOT_DIRECTORY = process.env.ROOT_DIRECTORY || __dirname;
const DATABASE = process.env.DATABASE || 'mongodb://mongo/hdafg';
const MAIL_HOST = process.env.MAIL_HOST || 'smtp.gmail.com';
const MAIL_PORT = process.env.MAIL_PORT || 465;
const MAIL_SECURE_CONNECTION = process.env.MAIL_SECURE_CONNECTION || true;
const MAIL_USER = process.env.MAIL_USER || `${CITY.toLowerCase()}.noreply.hdafg`;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || '';
const MAIL_TO = process.env.MAIL_TO || '';
const MAIL_FROM = process.env.MAIL_FROM || `h.d.a.fg ${CITY} <${CITY?.toLowerCase()}-noreply@hdafg.de>`;
const DOMAIN = process.env.DOMAIN || 'localhost';
const MAX_FAILED_ADMIN_LOGINS_PER_DAY = process.env.MAX_FAILED_ADMIN_LOGINS_PER_DAY || 5;
const MAX_REGISTRATIONS_PER_DAY = process.env.MAX_REGISTRATIONS_PER_DAY || 6;
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || 'uploads';
const DISALLOWED_FILE_NAMES_FOR_UPLOAD = process.env.DISALLOWED_FILE_NAMES_FOR_UPLOAD || '.gitkeep';
const MAX_UPLOAD_DIRECTORY_SIZE = process.env.MAX_UPLOAD_DIRECTORY_SIZE || 3489660928; // Default: 3489660928; equals 3.25GiB
const MAX_UPLOAD_FILE_SIZE = process.env.MAX_UPLOAD_FILE_SIZE || 10737418240; // Default: 10737418240; equals 10GiB
const MAINTENANCE_REDIRECT_URL = process.env.MAINTENANCE_REDIRECT_URL || '';

module.exports = {
    MODE,
    CITY,
    ALL_CITIES,
    ROOT_DIRECTORY,
    DATABASE,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO,
    MAIL_FROM,
    DOMAIN,
    MAX_FAILED_ADMIN_LOGINS_PER_DAY,
    MAX_REGISTRATIONS_PER_DAY,
    UPLOAD_DIRECTORY,
    DISALLOWED_FILE_NAMES_FOR_UPLOAD,
    MAX_UPLOAD_DIRECTORY_SIZE,
    MAX_UPLOAD_FILE_SIZE,
    MAINTENANCE_REDIRECT_URL
};
*/

require('dotenv').config();
const envs = process.env;

module.exports = {
    // General
    ROOT_DIRECTORY: envs.ROOT_DIRECTORY || __dirname,
    DATABASE: envs.DATABASE || 'mongodb://localhost/hdafg',
    DOMAIN: envs.DOMAIN || 'localhost',
    SECRET_FOR_SESSION: envs.SECRET_FOR_SESSION,
    ALL_CITIES: envs.ALL_CITIES,

    // Mail
    MAIL_HOST: envs.MAIL_HOST || 'smtp.gmail.com',
    MAIL_PORT: envs.MAIL_PORT || 465,
    MAIL_SECURE_CONNECTION: envs.MAIL_SECURE_CONNECTION || true,
    MAIL_USER_LU: envs.MAIL_USER_LU,
    MAIL_PASSWORD_LU: envs.MAIL_PASSWORD_LU,
    MAIL_FROM_LU: envs.MAIL_FROM_LU || 'h.d.a.fg Ludwigsfelde <fakeentry@hdafg.de>',
    MAIL_USER_MA: envs.MAIL_USER_MA,
    MAIL_PASSWORD_MA: envs.MAIL_PASSWORD_MA,
    MAIL_FROM_MA: envs.MAIL_FROM_MA || 'h.d.a.fg Marburg <fakeentry@hdafg.de>',
    MAIL_TO: envs.MAIL_TO,

    // Block spam
    MAX_FAILED_ADMIN_LOGINS_PER_DAY: envs.MAX_FAILED_ADMIN_LOGINS_PER_DAY || 5,
    MAX_REGISTRATIONS_PER_DAY: envs.MAX_REGISTRATIONS_PER_DAY || 6,
    UPLOAD_DIRECTORY: envs.UPLOAD_DIRECTORY || 'uploads',
    DISALLOWED_FILE_NAMES_FOR_UPLOAD: envs.DISALLOWED_FILE_NAMES_FOR_UPLOAD || '.gitkeep',
    MAX_UPLOAD_DIRECTORY_SIZE: envs.MAX_UPLOAD_DIRECTORY_SIZE || 3489660928, // Default: 3489660928; equals 3.25GiB
    MAX_UPLOAD_FILE_SIZE: envs.MAX_UPLOAD_FILE_SIZE || 10737418240 // Default: 10737418240; equals 10GiB
};
