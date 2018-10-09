const AbstractEventEmitter = require('./eventemitter.js');
const readline = require('readline');

class TerminalInput extends AbstractEventEmitter {
  constructor() {
    super();
  }

  captureInput(isWebserverActive) {
    (async () => {
      if (!isWebserverActive) {
        if (await this.promptWebserver()) {
          this.emit('startServer');
        }
      }
      let input = await this.readFromTerminal();
      this.emit('input', input);
    })();
  }

  promptWebserver(isRetry) {
    if (!isRetry) {
      this.emit("message.always", "Before going onto calculating paths from your input, would you like to enable the webserver?\n" +
                  "The webserver provides a graphical display of the results of your input\n");
    }

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
                    input: process.stdin,
                   output: process.stdout
                 });
      const questionText = !isRetry ? 'Start webserver? [y/N] ' : 'Only "y" or "n" characters are allowed. Start webserver? [y/N] ';
      rl.question(questionText, answer => {
        rl.close();
        if (['', 'y', 'Y', 'n', 'N'].indexOf(answer) === -1) {
          return resolve(this.promptWebserver(true));
        }

        resolve(['Y', 'y'].indexOf(answer) > -1);
      });
    });
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
