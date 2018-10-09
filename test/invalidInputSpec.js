const assert = require('chai');
const expect = require('chai').use(require('chai-as-promised')).expect;
const sinon = require('sinon');
const app = require('../index');

describe("Invalid input tests", function() {
  it("triggers error event when invalid file path is submitted", function() {
    let spy = sinon.spy();
    app.fileReader.once('error', spy);
    app.processFileSync('./test/resources/nofile');
    expect(spy.calledOnce).to.be.true;
    expect(spy.args[0][0].code).to.equal('ENOENT');
  })

  it("triggers error event when an empty file is submitted", function() {
    let spy = sinon.spy();
    app.interceptOnce('error', spy);
    app.processFileSync('./test/resources/empty');
    expect(spy.calledOnce).to.be.true;
  })

  it("triggers error event when a file with only map dimensions is submitted", function() {
    let spy = sinon.spy();
    app.interceptOnce('error', spy);
    app.processFileSync('./test/resources/onlymap');
    expect(spy.calledOnce).to.be.true;
  })

  it("triggers error event when a file with only rover pathing information is submitted", function() {
    let spy = sinon.spy();
    app.interceptOnce('error', spy);
    app.processFileSync('./test/resources/onlyrovers');
    expect(spy.calledOnce).to.be.true;
  })

  it("triggers error event when invalid map dimensions are provided", function() {
    let spy = sinon.spy();
    app.interceptOnce('error', spy);
    app.processFileSync('./test/resources/invalidmap');
    expect(spy.calledOnce).to.be.true;
  });
});
