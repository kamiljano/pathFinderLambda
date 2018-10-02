'use strict';

const rewire = require('rewire');
const chai = require('chai');
chai.use(require('sinon-chai'));
chai.should();
const sinon = require('sinon');

describe('GIVEN distributionService.splitJob()', () => {

  let service;
  let publish;
  let flush;
  let sync;
  let lastSqsArnUsed;

  beforeEach(() => {
    process.env.MAX_JOBS_TO_CREATE = '1000';
    process.env.JOB_QUEUE = 'sqsArn';

    publish = sinon.stub();
    flush = sinon.stub();
    sync = sinon.stub().returns(Promise.resolve());
    const BufferedJobPublisher = function(sqsArn) {
      this.publish = publish;
      this.flush = flush;
      this.sync = sync;
      lastSqsArnUsed = sqsArn;
    };

    service = rewire('../../../lib/distribution/distributionService');
    service.__set__({BufferedJobPublisher});
  });

  it('WHEN the request contains 1 IP to scan, THEN only one instance is spawned, with the same parameters as the original one', async () => {
    const body = {
      from: '0.0.0.100',
      to: '0.0.0.100',
      path: '/',
      regex: 'abc'
    };
    await service.splitJob('txId', body);
    publish.should.have.been.calledOnceWith({
      txId: 'txId',
      from: '0.0.0.100',
      to: '0.0.0.100',
      path: '/',
      regex: 'abc'
    });

    flush.should.have.been.calledOnce;
    sync.should.have.been.calledOnce;
    lastSqsArnUsed.should.equal('sqsArn');
  });

  it('WHEN the request is small, THEN only one instance is spawned, with the same parameters as the original one', async () => {
    const body = {
      from: '0.0.0.0',
      to: '0.0.0.100',
      path: '/',
      regex: 'abc'
    };
    await service.splitJob('txId', body);
    publish.should.have.been.calledOnceWith({
      txId: 'txId',
      from: '0.0.0.0',
      to: '0.0.0.100',
      path: '/',
      regex: 'abc'
    });

    flush.should.have.been.calledOnce;
    sync.should.have.been.calledOnce;
    lastSqsArnUsed.should.equal('sqsArn');
  });

  it('WHEN the request covers 1.5 times as many IPs as can be covered in one call, THEN 2 instances are spawned with appropriate IP ranges', async () => {
    await service.splitJob('abcd', {
      from: '0.0.0.0',
      to: '0.0.4.100',
      path: '/',
      regex: 'abc'
    });
    publish.should.have.been.calledTwice;
    publish.should.have.been.calledWith({
      txId: 'abcd',
      from: '0.0.0.0',
      to: '0.0.3.232',
      path: '/',
      regex: 'abc'
    });
    publish.should.have.been.calledWith({
      txId: 'abcd',
      from: '0.0.3.233',
      to: '0.0.4.100',
      path: '/',
      regex: 'abc'
    });
  });

  it('WHEN the request covers exactly twice as many IPs as can be covered in one call, THEN 2 instances are spawned with appropriate IP ranges', async () => {
    await service.splitJob('txId', {
      from: '0.0.0.0',
      to: '0.0.7.209',
      path: '/',
      regex: 'abc'
    });
    publish.should.have.been.calledTwice;
    publish.should.have.been.calledWith({
      txId: 'txId',
      from: '0.0.0.0',
      to: '0.0.3.232',
      path: '/',
      regex: 'abc'
    });
    publish.should.have.been.calledWith({
      txId: 'txId',
      from: '0.0.3.233',
      to: '0.0.7.209',
      path: '/',
      regex: 'abc'
    });
  });
});