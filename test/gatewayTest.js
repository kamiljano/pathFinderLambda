'use strict';

const rewire = require('rewire');
const chai = require('chai');
chai.use(require('sinon-chai'));
chai.should();
const sinon = require('sinon');

describe('GIVEN the REST API Gateway', () => {

  let bufferedJobPublisher;
  let gateway;
  const txId = 'txId';

  beforeEach(() => {
    bufferedJobPublisher = {
      publish: sinon.stub().returns(Promise.resolve()),
      flush: sinon.stub().returns(Promise.resolve()),
      sync: sinon.stub().returns(Promise.resolve())
    };
    const BufferedJobPublisher = function() {
      this.publish = bufferedJobPublisher.publish;
      this.flush = bufferedJobPublisher.flush;
      this.sync = bufferedJobPublisher.sync;
    };
    gateway = rewire('../gateway');
    gateway.__set__({BufferedJobPublisher});
  });

  const event = (from, to, path, regex) => ({
    requestContext: {
      requestId: txId
    },
    body: JSON.stringify({from, to, path, regex})
  });

  it('WHEN the request is valid AND does not contain the regex, THEN the job is successfully created', async () => {
    const result = await gateway.find(event('0.0.0.0', '0.0.0.0', '/'));
    bufferedJobPublisher.publish.should.have.been.calledWith({
      txId,
      from: '0.0.0.0',
      to: '0.0.0.0',
      path: '/',
      regex: undefined
    });
    bufferedJobPublisher.flush.should.have.been.called;
    bufferedJobPublisher.sync.should.have.been.called;
    result.statusCode.should.equal(202);
  });

  it('WHEN the request is valid AND contains the regex, THEN the job is successfully created', async () => {
    const result = await gateway.find(event('0.0.0.0', '0.0.0.0', '/', 'reg'));
    bufferedJobPublisher.publish.should.have.been.calledWith({
      txId,
      from: '0.0.0.0',
      to: '0.0.0.0',
      path: '/',
      regex: 'reg'
    });
    bufferedJobPublisher.flush.should.have.been.called;
    bufferedJobPublisher.sync.should.have.been.called;
    result.statusCode.should.equal(202);
  });

  it('WHEN the request lacks the "from" parameter, THEN 400 is returned', async () => {
    const result = await gateway.find(event(undefined, '0.0.0.0', '/', 'reg'));
    bufferedJobPublisher.publish.should.not.have.been.called;
    result.statusCode.should.equal(400);
  });

  it('WHEN the request lacks the "to" parameter, THEN 400 is returned', async () => {
    const result = await gateway.find(event('0.0.0.0', undefined, '/', 'reg'));
    bufferedJobPublisher.publish.should.not.have.been.called;
    result.statusCode.should.equal(400);
  });

  it('WHEN the request lacks the "path" parameter, THEN 400 is returned', async () => {
    const result = await gateway.find(event('0.0.0.0', '0.0.0.0', undefined, 'reg'));
    bufferedJobPublisher.publish.should.not.have.been.called;
    result.statusCode.should.equal(400);
  });

  it('WHEN the parameter "from" is in invalid format, THEN 400 is returned', async () => {
    const result = await gateway.find(event('invalidIp', '0.0.0.0', '/', 'reg'));
    bufferedJobPublisher.publish.should.not.have.been.called;
    result.statusCode.should.equal(400);
  });

  it('WHEN the parameter "to" is in invalid format, THEN 400 is returned', async () => {
    const result = await gateway.find(event('0.0.0.0', 'invalidIp', '/', 'reg'));
    bufferedJobPublisher.publish.should.not.have.been.called;
    result.statusCode.should.equal(400);
  });

  it('WHEN an unexpected error is thrown, THEN the response 500 is returned', async () => {
    bufferedJobPublisher.sync.returns(Promise.reject(new Error('testError')));
    const result = await gateway.find(event('0.0.0.0', '0.0.0.0', '/', 'reg'));
    result.statusCode.should.equal(500);
  });
});