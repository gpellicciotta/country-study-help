import { expect } from 'chai';
import sinon from 'sinon';
import logging from './logging.mjs';

describe('Logging Module', () => {
  let consoleLogStub, consoleDebugStub, consoleInfoStub, consoleWarnStub, consoleErrorStub;

  beforeEach(() => {
    consoleLogStub = sinon.stub(console, 'log');
    consoleDebugStub = sinon.stub(console, 'debug');
    consoleInfoStub = sinon.stub(console, 'info');
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    consoleLogStub.restore();
    consoleDebugStub.restore();
    consoleInfoStub.restore();
    consoleWarnStub.restore();
    consoleErrorStub.restore();
  });

  it('should log messages using console.log', () => {
    logging.log('test log message');
    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.calledWith('test log message')).to.be.true;
  });

  it('should log debug messages using console.debug', () => {
    logging.debug('test debug message');
    expect(consoleDebugStub.calledOnce).to.be.true;
    expect(consoleDebugStub.calledWith('test debug message')).to.be.true;
  });

  it('should log info messages using console.info', () => {
    logging.info('test info message');
    expect(consoleInfoStub.calledOnce).to.be.true;
    expect(consoleInfoStub.calledWith('test info message')).to.be.true;
  });

  it('should log warning messages using console.warn', () => {
    logging.warn('test warn message');
    expect(consoleWarnStub.calledOnce).to.be.true;
    expect(consoleWarnStub.calledWith('test warn message')).to.be.true;
  });

  it('should log error messages using console.error', () => {
    logging.error('test error message');
    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledWith('test error message')).to.be.true;
  });
});