let AbstractEventEmitter = require('./eventemitter');

class Rover extends AbstractEventEmitter {
  constructor(x, y, orientation) {
    super();

    this.x = x;
    this.y = y;
    this.orientation = orientation;
    this.movementHistory = [];

    this.isCollided = false;
    this.collisionWith = -1;
    this.isOnPlateau = true;
    this.failedPosition = [];
  }

  applyPath(pathStr) {
    if (this.isCollided || !this.isOnPlateau) {
      return;
    }

    let path = pathStr.split('');
    let pathCoordinates = [{x: this.x, y: this.y}];
    path.forEach(movement => {
      switch(movement) {
        case 'M':
          this.move();
          pathCoordinates.push({x: this.x, y: this.y});
          break;

        default:
          this.rotate(movement);
      }
    });

    this.movementHistory = this.movementHistory.concat(pathCoordinates);
    this.emit('pathMoved', pathCoordinates);
  }

  rotate(direction) {
    let switchOffset = direction == 'L' ? -1 : 1;
    let cardinalPoints = ['N', 'E', 'S', 'W'];
    let newOrientationIndex = (cardinalPoints.indexOf(this.orientation) + switchOffset + 4) % 4;
    this.orientation = cardinalPoints[newOrientationIndex];
  }

  move() {
    switch(this.orientation) {
      case 'N':
        this.y += 1;
        break;

      case 'S':
        this.y -= 1;
        break;
      case 'E':
        this.x += 1;
        break;
      case 'W':
        this.x -= 1;
        break;
    }
  }

  get position() {
    return `${this.x} ${this.y} ${this.orientation}${this.isCollided ? ` collided with rover ${this.affectedRover+1}` : ''}${!this.isOnPlateau ? ' rover fell off plateau' : ''}`;
  }

  set position(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }
}

module.exports = Rover;
