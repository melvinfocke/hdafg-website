function convertToDate(str) {
    str = str || '';
    // 29.06.2021 13:39:42
    let dateObj = str.split('.');
    let timeObj = dateObj[2]?.split(' ')[1]?.split(':') || [];
    dateObj[2] = dateObj[2]?.split(' ')[0];

    const fullDate = new Date(
        `${dateObj[2] || '0000'}-${dateObj[1] || '00'}-${dateObj[0] || '00'}T` +
            `${timeObj[0] || '00'}:${timeObj[1] || '00'}:${timeObj[2] || '00'}`
    );

    return fullDate.getTime();
}

function convertToDateAsString(date) {
    date = date || new Date();

    const dateObj = [makeTwoDigit(date.getDate()), makeTwoDigit(date.getMonth() + 1), date.getFullYear()];
    const timeObj = [makeTwoDigit(date.getHours()), makeTwoDigit(date.getMinutes()), makeTwoDigit(date.getSeconds())];

    return `${dateObj[0]}.${dateObj[1]}.${dateObj[2]} ${timeObj[0]}:${timeObj[1]}:${timeObj[2]}`;
}

function makeTwoDigit(number) {
    let numberString = `${number}`;
    if (Math.abs(number) >= 0 && Math.abs(number) <= 9) numberString = `0${number}`;
    return numberString;
}

module.exports = { convertToDate, convertToDateAsString };
