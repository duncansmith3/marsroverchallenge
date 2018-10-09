const AbstractEventEmitter = require('./eventemitter');
const express = require('express');
const app = express();

class WebServer extends AbstractEventEmitter {
  constructor(host, port) {
    super();

    this.host = host || '127.0.0.1';
    this.port = port || ((Math.random() * 10000) >> 0) + 50000;
    this.app = express();
  }

  start(host, port) {
    this.host = host || this.host;
    this.port = port || this.port;
    this.app.listen(this.port, this.host);
    this.emit('message.info', `
Webserver started on http://${this.host}:${this.port}
`);
  }
}

module.exports = WebServer;
