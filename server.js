"use strict";

const express = require('express');
const request = require('superagent');

const app = express();

app.use('/', express.static(__dirname + '/dist'));

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/host', (req, res) => {
  const host = process.env.HOST || 'http://localhost:3002';
  res.status(200).json({host});
});

const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('connection made with headers ', socket.handshake.headers);
  socket.on("echo", (message) => {
    console.log('echoing', message);
    socket.emit('echo', message);
  });
  socket.on('disconnect', () => {
    console.log('disconnect');
  });
});

http.listen(port, () => {
  console.log('Listening on ' + port);
});
