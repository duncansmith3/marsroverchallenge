const readline = require('readline');
const TerminalInput = require('./lib/terminalInput');
const FileReader = require('./lib/filereader');
const WebServer = require('./lib/webserver');
const MarsMap = require('./lib/map');
const Rover = require('./lib/rover');
const Logger = require('./lib/logger');

let logger = new Logger('INFO', module.parent);

function App(opts) {
  this.terminal = new TerminalInput();
  this.fileReader = new FileReader();
  this.server = new WebServer();

  this.marsMap = null;
  this.rovers = [];

  let _listeners = {};
  Object.defineProperty(this, 'listeners', {
    get: function() {
      return _listeners;
    }
  });

  let _oneshot = {};
  Object.defineProperty(this, 'oneshot', {
    get: function() {
      return _oneshot;
    }
  });

  if (opts.isParent) {
    this.args = this.processArguments(process.argv.slice(2)) || [];
    if (this.args.verbose) {
      logger.setLevel('TRACE');
    }
    else if (this.args.debug) {
      logger.setLevel('DEBUG');
    }
    if (this.args.hasOwnProperty('h')) {
      this.displayOptions();
      process.exit();
    }
    else if (!this.args.file && !this.args.web) {
      this.terminal.captureInput();
    }
    else if (this.args.file) {
      this.fileReader.processFromFile(this.args.file)
        .catch();
    }
    else if (this.args.web) {
      this.server.start(this.args.host, this.args.port);
    }
  }

  return this;
}


App.prototype = {
  constructor: App,
  attachListeners: function() {
    this.terminal.on('startServer', () => this.server.start());
    ['terminal', 'fileReader', 'server'].forEach(logConsumer => {
      this[logConsumer].on('message.trace', function() {
        logger.trace.apply(null, Array.prototype.slice.call(arguments));
      });
      this[logConsumer].on('message.debug', function() {
        logger.debug.apply(null, Array.prototype.slice.call(arguments));
      });
      this[logConsumer].on('message.info', function() {
        logger.info.apply(null, Array.prototype.slice.call(arguments));
      });
      this[logConsumer].on('message.warn', function() {
        logger.warn.apply(null, Array.prototype.slice.call(arguments));
      });
      this[logConsumer].on('message.error', function() {
        logger.error.apply(null, Array.prototype.slice.call(arguments));
      });
      this[logConsumer].on('message.always', function(msg) {
        logger.always(msg);
      });
    });
  },
  processArguments: function(args) {
    let availableOpts = {
      '-help': {
        key: 'h',
        expected: 'boolean'
      },
      '-web': {
        key: 'web',
        expected: 'boolean'
      },
      '-host': {
        key: 'host',
        expected: 'text'
      },
      '-port': {
        key: 'port',
        expected: 'number'
      },
      '-file': {
        key: 'file',
        expected: 'text'
      },
      '-verbose': {
        key: 'verbose',
        expected: 'boolean'
      }
    };
    let opts = args.map(opt => opt.replace('-', ''));
    opts = opts.reduce((collect, opt) => {
             let givenOpt = opt.split('=');
             let givenKey = givenOpt[0];
             let givenVal = givenOpt[1];

             if (availableOpts.hasOwnProperty(givenKey) && !collect.hasOwnProperty(givenKey)) {
               if (availableOpts[givenKey].expected === 'boolean') {
                 collect[availableOpts[givenKey].key] = true;
               }
               else if (givenVal) {
                 if (availableOpts[givenKey].expected === 'number' && !isNaN(+givenVal)) {
                   collect[availableOpts[givenKey].key] =+givenVal; 
                 }
                 else if (availableOpts[givenKey].expected === 'text') {
                   collect[availableOpts[givenKey].key] = givenVal;
                 }
               }
             }
             return collect;
           }, {});
    return opts;
  },
  validateInput: function(input) {
    if (!input || !input.length) {
        throw new Error("No input provided");
    }

    if (!input[0].match(/^-?\d+\s-?\d+$/)) {
        throw new Error("Map dimensions not properly defined");
    }

    let roverInfo = input.slice(1);

    if (!roverInfo.length) {
      throw new Error("No rover information provided");
    }

    if (roverInfo.length % 2 !== 0) {
      throw new Error("Invalid number of rover actions (needs a better reason... just know every rover needs a path, so an even number of stuff)");
    }

    for (let i = 1, n = roverInfo.length; i < n; i += 2) {
      let isValidPosition = roverInfo[i-1].match(/^\d+\s\d+\s(N|S|E|W)$/);
      let isValidPath = roverInfo[i].match(/^(L|M|R)+$/);

      if (!isValidPosition) {
        throw new Error(`Rover has invalid position at index ${i-1}`);
      }
      else if (!isValidPath) {
        throw new Error(`Rover has invalid pathing information at index ${i}`);
      }
    }

    return true;
  },
  runCalculation: function(input) {
    let [width, height] = input.shift().split(' ').map(digit => +digit);
    if (width < 1 || height < 1) {
      throw new Error(`Invalid dimensions for the plateau: positive width and height expected but received ${width} ${height}`);
    }

    this.marsMap = new MarsMap(width, height);
    this.rovers = [];

    input
      .filter((line, index) => index % 2 === 0)
      .forEach((positionInfo, index) => {
        let [x, y, orientation] = positionInfo.split(' ');
        let rover = new Rover(+x, +y, orientation);
        this.marsMap.setRoverPosition(index, {x: +x, y: +y});
        rover.on('pathMoved', path => this.logPath(index, path));
        rover.on('failure', () => this.logFailure(index));
        this.rovers.push(rover);
      });

    input
      .filter((line, index) => index % 2)
      .forEach((pathInfo, index) => {
        this.rovers[index].applyPath(pathInfo);
      });

    let result = this.rovers
                  .map(rover => rover.position);

    logger.trace(this.rovers);
    return result;
  },
  logPath: function(roverIndex, path) {
    let validation = this.marsMap.validatePath(roverIndex, path);
    if (validation.valid) {
      return;
    }

    this.rovers[roverIndex].position = validation.failPosition;

    if (validation.result === 'crash' && validation.affectedRover > -1) {
      this.rovers[validation.affectedRover].isCollided = true;
      this.rovers[validation.affectedRover].affectedRover = roverIndex;
      this.rovers[roverIndex].isCollided = true;
      this.rovers[roverIndex].affectedRover = validation.affectedRover;
    }
    else {
      this.rovers[roverIndex].isOnPlateau = false;
    }
  },
  processFileSync: function(filepath) {
    this.fileReader.processFromFileSync(filepath);
  },
  processFile: function(filepath) {
    this.fileReader.processFromFile(filepath);
  },
  displayOptions: function() {
    logger.info(`
Mars rover challenge. See https://code.google.com/archive/p/marsrovertechchallenge/

Provide input of the form blah blah blah

Usage: node index [OPTION]...
Example: node index --web --host=192.168.8.1 --port=8080
         node index --file=./roverinstructions.txt

Options:
  --web			Start a web UI for challenge. Allows users to view movements and/or provide input to the application.
  --host=hostname	Bind the webserver to hostname (defaults to localhost). Requires the web UI option.
  --port=port		Bind the webserver to a specific port (defaults to a random unused port >50000). Requires the web UI option.
  --file=filepath	Use the file at location \`filepath\` as input to the application. Files should be UTF-8 formatted.
  --verbose		Extra logging. Think trace loglevel.

Report bugs to https://github.com/duncansmith3/marsroverchallenge.
`);
  },
  _subscribeToEvent: function(type, ev, fnObj) {
    if (!this[type][ev]) {
      this[type][ev] = {};
    }

    let token = null;
    do {
      token = (Math.random() + 1).toString(36).substring(2, 10);
    } while (!!this[type][token]);

    fnObj = typeof fnObj == 'function' ? {fn: fnObj, scope: null} : fnObj;
    this[type][ev][token] = {
      scope: fnObj.scope || null,
         fn: fnObj.fn
    };

    return token;
  },
  once: function(ev, fnObj) {
    return this._subscribeToEvent('oneshot', ev, fnObj);
  },
  on: function(ev, fnObj) {
    return this._subscribeToEvent('listeners', ev, fnObj);
  },
  off: function(ev, token) {
    if (!ev || !token) {
      return false;
    }

    if (this.listeners[ev] && this.listeners[ev][token]) {
      delete this.listeners[ev][token];
      return true;
    }

    if (this.oneshot[ev] && this.oneshot[ev][token]) {
      delete this.oneshot[ev][token];
      return true;
    }

    return false;
  },
  emit: function(ev, vals) {
    let args = Array.prototype.slice.call(arguments);
    ev = args[0];
    val = args.slice(1);
    ['listeners', 'oneshot'].forEach(fnType => {
      if (this[fnType][ev]) {
        for (let key in this[fnType][ev]) {
          let scope = this[fnType][ev][key].scope;
          let fn = this[fnType][ev][key].fn;
          (function() {
            fn.apply(scope, val);
          }.bind(scope))();
        }
      }
    });

    if (this.oneshot[ev]) {
      delete this.oneshot[ev];
    }

    if (this.interceptors) {
      this.notifyInterceptors(ev, vals);
    }
  }
}

let app = new App({isParent: !module.parent});

(function AttachListeners() {
  app.attachListeners();
  ['terminal', 'fileReader'].forEach(gatherer => {
    this[gatherer].on('input', async (input) => {
      try {
        input = input.filter(line => !!line);

        if (this.validateInput(input)) {
          let results = this.runCalculation(input);
          this.notify('results', results);
        }
      } catch (e) {
        logger.error('Unable to calculate:', e);
        this.notify('error', e);
      }
    });
    this[gatherer].on('error', err => {
      logger.error('Unable to calculate:', err);
    });
  });
}.bind(app))();


if (module.parent) {
  app.interceptors = {};
  app.interceptOnce = (ev, fnObj) => {
    if (!app.interceptors[ev]) {
      app.interceptors[ev] = [];
    }

    fnObj = typeof fnObj == 'function' ? {fn: fnObj, scope: null} : fnObj;
    app.interceptors[ev].push({
      scope: fnObj.scope || null,
         fn: fnObj.fn
    });
  };
  app.notifyInterceptors = (ev, val) => {
    if (app.interceptors[ev]) {
      app.interceptors[ev].forEach(interceptor => {
        let scope = interceptor.scope;
        let fn = interceptor.fn;
        (function() {
          fn.apply(scope, val);
        }.bind(scope))();
      });
    }
  };
  module.exports = app;
}
else {
  app.on('results', results => { logger.always(results.join("\n"));});
}

app.notify = function(ev, vals) {
  if (!module.parent) {
    this.emit(ev, vals);
  }
  else {
    this.notifyInterceptors(ev, vals);
  }
}.bind(app);
