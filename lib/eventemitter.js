/**
 * "Abstract" class of a simple event emitter pattern
 *
 * Register a callback to an event with `.on(eventName, callback)` or `.once(eventName, callback)`.
 * Event emission triggers `callback(eventName[, param1, param2, ... ])`, where `param1, param2, ...`
 * are optional parameters applied to the callback. Use `arguments` to capture all possible
 * returned values.
**/

class AbstractEventEmitter {
  constructor() {
    if (new.target === AbstractEventEmitter) {
      throw new TypeError('Cannot construct AbstractEventEmitter instances directly');
    }

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
  }

  _register(type, ev, fnObj) {
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
  }

  on(ev, fnObj) {
    return this._register('listeners', ev, fnObj);
  }

  once(ev, fnObj) {
    return this._register('oneshot', ev, fnObj);
  }

  off(ev, token) {
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
  }

  emit(ev, val) {
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
  }
}

module.exports = AbstractEventEmitter;
