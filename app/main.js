'use strict';

/* jshint esversion: 6 */
/* jshint node: true */

const io = require('socket.io-client');
const request = require('superagent');

const sleep = time => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

new Promise((resolve, reject) => {
  request.get('/host').send().end((err, res) => {
     if (err || !res.ok) {
       reject(err || res);
     } else {
       resolve(res.body.host);
     }
  });
}).then(host => {
  console.log('host is ' + host);

  const socket = io.connect(host);

  socket.on('connect', () => {
    console.log('connected!');
    socket.emit('echo', 'Testing... Testing... 1234');
  });

  socket.on('echo', message => {
    console.log('received', message);
    sleep(3000).then(() => {
      console.log('sending ', message);
      socket.emit('echo', message + '.');
    });
  });
}).catch(e => console.error(e));
