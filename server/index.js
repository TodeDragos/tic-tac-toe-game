
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../client/public');


app.get('/', function (req, res) {
    res.sendFile(publicDirectoryPath + '/index.html');
});

app.use(express.static(publicDirectoryPath));

var players = 0;

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    players ++;

    if(players > 2) {
        socket.emit('connected' , 'Maximum number of players has been reached' )
    }
    else 
        socket.emit('connected' , players )
    
    socket.on('disconnect', () => {
        console.log('player: ' + players + ' disconnected')
        players --
    })

    socket.on('strike', (cellNumber) => {
        socket.broadcast.emit('strike', cellNumber)
    })
    
    socket.on('restart', () => {
        socket.broadcast.emit('restart')
    })
})

server.listen(port, () => {
    console.log(`Tic-tac-toe game server is up on port ${port}!`);
})