module.exports = function (io) {
    io.sockets.on('connection', (socket) => {
        console.log(socket.id);
        console.log(socket.request.isAuthenticated());
        socket.on('sendSetting', async (data) => {
            const ip = socket.request.connection.remoteAddress;
            console.log();
        });
    });
};
