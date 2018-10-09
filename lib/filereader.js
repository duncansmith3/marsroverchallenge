const AbstractEventEmitter = require('./eventemitter.js');
const fs = require('fs');

class FileReader extends AbstractEventEmitter {
  constructor() {
    super();
  }

  processFromFile(filepath) {
    return new Promise(async (resolve, reject) => {
      try {
        let input = await this.readFile(filepath);
        this.emit('input', input);
        resolve(input);
      } catch(e) {
        this.emit('error', e);
        reject(e);
      }
    });
  }

  processFromFileSync(filepath) {
    try {
      let input = this.readFileSync(filepath);
      this.emit('input', input);
    } catch(e) {
      this.emit('error', e);
    }
  }

  readFile(filepath) {
    return new Promise((resolve, reject) => {
      this.emit('message.info', `Reading from ${filepath}
`);

      fs.readFile(filepath, 'utf8', (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result.split("\n"));
      });
    });
  }

  readFileSync(filepath) {
    let contents = fs.readFileSync(filepath, 'utf8')
    return contents.split("\n");
  }
}

module.exports = FileReader;
