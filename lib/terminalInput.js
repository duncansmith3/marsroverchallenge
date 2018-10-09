const AbstractEventEmitter = require('./eventemitter.js');
const readline = require('readline');

class TerminalInput extends AbstractEventEmitter {
  constructor() {
    super();
  }

  captureInput() {
    (async () => {
      let input = await this.readFromTerminal();
      this.emit('input', input);
    })();
  }

  readFromTerminal() {
    return new Promise(resolve => {
      const rl = readline.createInterface({
                    input: process.stdin,
                   output: process.stdout
                 });

      this.emit("message.always", "Enter your input below:");

      let input = [];
      rl.on("line", line => {
        if (!line.length) {
          rl.close();
          resolve(input);
        }
        input.push(line);
      });
    });
  }
}

module.exports = TerminalInput;
