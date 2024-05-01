module.exports = io => {
    let timeInterval = 0;
    io.on('connection', socket => {
        console.log('New socket connection');

        let currentCode = null;
        

        socket.on('move', function(move) {
            console.log('move detected')

            io.to(currentCode).emit('newMove', move);
        });
        
        socket.on('joinGame', function(data) {
            
            currentCode = data.code;
            socket.join(currentCode);
            if (!games[currentCode]) {
                timeInterval = data.time;
                games[currentCode] = true;
                return;
            }
            
            io.to(currentCode).emit('startGame', timeInterval);
        });

        socket.on('disconnect', function() {
            console.log('socket disconnected');

            if (currentCode) {
                io.to(currentCode).emit('gameOverDisconnect');
                delete games[currentCode];
            }
        });

        socket.on('timeout', function() {
            console.log('clock timeout');
            if (currentCode) {
                io.to(currentCode).emit('gameOverTimeout');
            }
        });

        // Add chat function here
        socket.on('message', (message) => {
            console.log(message);
            io.emit('message', `${message}`);
        });
    });
};