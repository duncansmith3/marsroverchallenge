class MarsMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.roverPositions = [];
  }

  setRoverPosition(roverIndex, position) {
    if (!roverIndex && !position) {
      return;
    }

    let pos = position || roverIndex;
    if (!position) {
      roverIndex = this.roverPositions.length;
    }

    this.roverPositions[roverIndex] = pos;
  }

  validatePath(roverIndex, pathTaken) {
    let fallIndex = -1;
    let fallPosition = pathTaken
                         .filter((point, pointIndex) => {
                           if (fallIndex === -1 && (point.x < 0 || point.y < 0 || point.x > this.width || point.y > this.height)) {
                             fallIndex = pointIndex;
                             return true;
                           }
                         })
                         .reduce((collect, pos) => collect || pos, null);

    let crashIndex = -1;
    let crashPosition = pathTaken
                          .filter(point => {
                            if (crashIndex > -1) {
                              return false;
                            }

                            return this.roverPositions.some((roverPosition, index) => {
                              if (crashIndex > -1) {
                                return false;
                              }
                              if (roverIndex !== index && roverPosition.x === point.x && roverPosition.y === point.y) {
                                crashIndex = index;
                                return true;
                              }
                            });
                          })
                          .reduce((collect, pos) => collect || pos, null);

    if (fallIndex === -1 && crashIndex === -1) {
      let finalPos = pathTaken[pathTaken.length - 1];
      this.roverPositions[roverIndex] = {
        x: finalPos.x,
        y: finalPos.y
      };
      return {valid: true};
    }

    let validation = {valid: false};
    if (fallIndex > -1 && crashIndex > -1) {
      validation.result = crashIndex < fallIndex ? 'crash' : 'fall';
      validation.failPosition = crashIndex < fallIndex ? crashPosition : fallPosition;
      validation.affectedRover = crashIndex < fallIndex ? crashIndex : null;
    }
    else if (fallIndex > -1) {
      validation.result = 'fall';
      validation.failPosition = fallPosition;
    }
    else {
      validation.result = 'crash';
      validation.failPosition = crashPosition;
      validation.affectedRover = crashIndex;
    }

    this.roverPositions[roverIndex] = {
      x: validation.failPosition.x,
      y: validation.failPosition.y
    };

    return validation;
  }

}

module.exports = MarsMap;
