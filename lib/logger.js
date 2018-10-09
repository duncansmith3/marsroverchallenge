class Logger {
  constructor(logLevel, isTest) {
    this.logLevel = 3;
    this.isTest = !!isTest;
  }

  setLevel(level) {
    let levels = {
      TRACE: 5,
      DEBUG: 4,
      INFO: 3,
      WARN: 2,
      ERROR: 1
    };
    this.logLevel = levels[level] || 3;
  }

  trace(str) {
    let args = ['TRACE:'].concat(Array.prototype.slice.call(arguments));
    if (!this.isTest && this.logLevel > 4) {
      console.log.apply(null, args);
    }
  }

  debug(str) {
    let args = ['DEBUG:'].concat(Array.prototype.slice.call(arguments));
    if (!this.isTest && this.logLevel > 3) {
      console.log.apply(null, args);
    }
  }

  info(str) {
    let args = ['INFO:'].concat(Array.prototype.slice.call(arguments));
    if (!this.isTest && this.logLevel > 2) {
      console.log.apply(null, args);
    }
  }

  warn(str) {
    let args = ['WARN:'].concat(Array.prototype.slice.call(arguments));
    if (!this.isTest && this.logLevel > 1) {
      console.log.apply(null, args);
    }
  }

  error(str) {
    let args = ['ERROR:'].concat(Array.prototype.slice.call(arguments));
    if (!this.isTest && this.logLevel > 0) {
      console.log.apply(null, args);
    }
  }

  always(str) {
    let args = Array.prototype.slice.call(arguments);
    if (!this.isTest) {
      console.log.apply(null, args);
    }
  }

}

module.exports = Logger;
