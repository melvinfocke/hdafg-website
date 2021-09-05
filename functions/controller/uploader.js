const fs = require('fs');
const path = require('path');

function deleteFilesWhichStartWith(dirPath, name) {
    files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        file = files[i];
        if (new String(file).startsWith(name)) fs.unlinkSync(`${dirPath}/${file}`);
    }
}

function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
};

const convertBytes = function (bytes) {
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

    if (bytes == 0) {
        return 'n/a';
    }

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

    if (i == 0) {
        return bytes + ' ' + sizes[i];
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

const getTotalSize = function (directoryPath) {
    const arrayOfFiles = getAllFiles(directoryPath);

    let totalSize = 0;

    arrayOfFiles.forEach(function (filePath) {
        totalSize += fs.statSync(filePath).size;
    });

    return totalSize;
    //return convertBytes(totalSize)
};

const getFileSize = function (filePath) {
    let size = fs.statSync(filePath).size;
    return convertBytes(size);
};

module.exports = { getTotalSize, getAllFiles, deleteFilesWhichStartWith, deleteFile, getFileSize };
