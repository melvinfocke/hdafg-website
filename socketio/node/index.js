module.exports = function (io) {
    let cityLowerCase = CITY.toLowerCase();
    io.of(`/${cityLowerCase}`).on('connection', (socket) => {
        socket.on('sendForm', async (data) => {});
    });
};

function truncate(str, n) {
    return str?.length > n ? str?.substr(0, n - 1) /*+ '&hellip;'*/ : str;
}
