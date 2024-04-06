const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('set nickname', (nickname) => {
    // Store nickname along with socket ID
    users[socket.id] = nickname;
    // Notify other users about new user joining with nickname
    socket.broadcast.emit('user connected', nickname);
  });

  // Handle chat message event
  socket.on('chat message', (msg) => {
    // Retrieve nickname of sender
    const nickname = users[socket.id];
    // Broadcast message with nickname to other users
    socket.broadcast.emit('chat message', { nickname, msg });
  });

  // Handle typing event
  socket.on('typing', () => {
    const nickname = users[socket.id];
    socket.broadcast.emit('user typing', nickname);
  });

  // Handle stop typing event
  socket.on('stop typing', () => {
    socket.broadcast.emit('user stop typing');
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    // Remove user from users object
    delete users[socket.id];
    // Notify connected users when someone disconnects, with nickname
    socket.broadcast.emit('user disconnected', nickname);
  });
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000/');
});
