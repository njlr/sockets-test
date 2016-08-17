"use strict";

const express = require('express');
const httpProxy = require('http-proxy');
const cookieParser = require('cookie-parser');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3002;
const target = process.env.target || 'http://localhost:3003';

console.log('target is ' + target);

const app = express();

app.use(cookieParser());

app.get('/', (req, res) => {
  res.end('This is a test load balancer');
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

const proxy = httpProxy.createProxy({
  ws : true
});

app.all('/socket.io/*', (req, res) => {
  proxy.web(req, res, {
    target,
    cookieDomainRewrite: true,
    hostRewrite: true
  }, e => {
    console.error('error any', e);
  });
});

const server = app.listen(port, () => {
  console.log('balancer started on port ' + port);
});

server.on('upgrade', (req, res) => {
  console.log('a connection was upgraded with headers ', req.headers);
  cookieParser()(req, res, () => {});
  proxy.ws(req, res, {
    target,
    hostRewrite: true
  }, e => {
    console.error('error ws', e);
  });
});
