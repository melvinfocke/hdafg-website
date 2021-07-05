require('dotenv').config();

const ROOT_DIRECTORY = process.env.ROOT_DIRECTORY || __dirname;
const DATABASE = process.env.DATABASE || 'mongodb://localhost/hdafg';
const MAIL_HOST = process.env.MAIL_HOST || 'smtp.gmail.com';
const MAIL_PORT = process.env.MAIL_PORT || 465;
const MAIL_SECURE_CONNECTION = process.env.MAIL_SECURE_CONNECTION || true;
const MAIL_USER = process.env.MAIL_USER || '';
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || '';
const MAIL_TO = process.env.MAIL_TO || '';
const DOMAIN = process.env.DOMAIN || 'localhost';
const MAX_FAILED_ADMIN_LOGINS_PER_DAY = process.env.MAX_FAILED_ADMIN_LOGINS_PER_DAY || 5;
const MAX_REGISTRATIONS_PER_DAY = process.env.MAX_REGISTRATIONS_PER_DAY || 3;
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || 'images';
const DISALLOWED_FILE_NAMES_FOR_UPLOAD =
    process.env.DISALLOWED_FILE_NAMES_FOR_UPLOAD ||
    '.gitkeep,apple-touch-icon-57.png,apple-touch-icon-60.png,apple-touch-icon-72.png,apple-touch-icon-76.png,apple-touch-icon-114.png,apple-touch-icon-120.png,apple-touch-icon-152.png,apple-touch-icon-167.png,apple-touch-icon-180.png,checkbox-pink-240-240.png,checkbox-pink-480-480.png,icon-16.png,icon-32.png,icon-48.png,icon-96.png,icon-144.png,icon-192.png,icon-256.png,icon-384.png,logo-138-42.png,logo-276-84.png,welcome-img-563-563.png,welcome-img-960-960.png,welcome-img-1400-1400.png,welcome-img-1950-1950.png,welcome-img-2600-2600.png,welcome-img-3024-3024.png';
const MAX_UPLOAD_DIRECTORY_SIZE = process.env.MAX_UPLOAD_DIRECTORY_SIZE || 3489660928; // Default: 3489660928; equals 3.25GiB
const MAX_UPLOAD_FILE_SIZE = process.env.MAX_UPLOAD_FILE_SIZE || 10737418240; // Default: 10737418240; equals 10GiB

module.exports = {
    ROOT_DIRECTORY,
    DATABASE,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE_CONNECTION,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_TO,
    DOMAIN,
    MAX_FAILED_ADMIN_LOGINS_PER_DAY,
    MAX_REGISTRATIONS_PER_DAY,
    UPLOAD_DIRECTORY,
    DISALLOWED_FILE_NAMES_FOR_UPLOAD,
    MAX_UPLOAD_DIRECTORY_SIZE,
    MAX_UPLOAD_FILE_SIZE
};
