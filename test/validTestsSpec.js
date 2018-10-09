const assert = require('chai');
const expect = require('chai').use(require('chai-as-promised')).expect;
const sinon = require('sinon');
const app = require('../index');

describe("Valid input tests", function() {

  it("correctly determines terminal positions #1", function() {
    app.processFileSync('./test/resources/valid2');
    expect(app.rovers[0].position).to.equal("15 12 E");
    expect(app.rovers[1].position).to.equal("8 1 S");
    expect(app.rovers[2].position).to.equal("12 8 W");
  });

  it("correctly determines terminal positions #2", function() {
    app.processFileSync('./test/resources/valid1');
    expect(app.rovers[0].position).to.equal("1 3 N");
    expect(app.rovers[0].isCollided).to.be.false;
    expect(app.rovers[0].isOnPlateau).to.be.true;
    expect(app.rovers[1].position).to.equal("5 1 E");
    expect(app.rovers[1].isCollided).to.be.false;
    expect(app.rovers[1].isOnPlateau).to.be.true;
  });
})
