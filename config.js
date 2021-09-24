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
