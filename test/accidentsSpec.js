const assert = require('chai');
const expect = require('chai').use(require('chai-as-promised')).expect;
const sinon = require('sinon');
const app = require('../index');

describe("Rover accident tests", function() {

  it("determines that rovers have crashed", function() {
    app.processFileSync('./test/resources/crash');
    expect(app.rovers[0].isCollided).to.be.true;
    expect(app.rovers[0].affectedRover).to.equal(1);
    expect(app.rovers[1].isCollided).to.be.true;
    expect(app.rovers[1].affectedRover).to.equal(0);
  });

  it("determines whether a rover has fallen off the plateau", function() {
    app.processFileSync('./test/resources/fall');
    expect(app.rovers[0].isOnPlateau).to.be.false;
    expect(app.rovers[1].position).to.equal("2 -1 S rover fell off plateau");
  });

  it("crash then fall should be a crash only", function() {
    app.processFileSync('./test/resources/crashfall');
    expect(app.rovers[0].isCollided).to.be.true;
    expect(app.rovers[0].isOnPlateau).to.be.true;
    expect(app.rovers[1].isCollided).to.be.true;
  });

  it("fall then crash should be a fall only", function() {
    app.processFileSync('./test/resources/fallcrash');
    expect(app.rovers[0].isCollided).to.be.false;
    expect(app.rovers[0].isOnPlateau).to.be.false;
    expect(app.rovers[1].isCollided).to.be.false;
  });
})
