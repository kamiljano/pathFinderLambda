'use strict';

const rewire = require('rewire');
const chai = require('chai');
chai.use(require('sinon-chai'));
chai.should();
const sinon = require('sinon');

describe('GIVEN distributionService.splitJob()', () => {

  let service;
  let lambdaInvoke;

  beforeEach(() => {
    process.env.MAX_IPS_TO_SCAN_PER_INSTANCE = '1000';

    lambdaInvoke = sinon.stub().returns({promise: () => Promise.resolve()});
    const AWS = {
      Lambda: function() {
        this.invoke = lambdaInvoke;
      }
    };

    service = rewire('../../../lib/distribution/distributionService');
    service.__set__({AWS});
  });

  it('WHEN the request is small, THEN only one instance is spawned, with the same parameters as the original one', async () => {
    const body = {
      from: '0.0.0.0',
      to: '0.0.0.100',
      path: '/',
      regex: 'abc'
    };
    const result = await service.splitJob('txId', body);
    result.should.be.deep.equal([
      {
        txId: 'txId',
        from: '0.0.0.0',
        to: '0.0.0.100',
        path: '/',
        regex: 'abc'
      }
    ]);
  });

  it('WHEN the request covers 1.5 times as many IPs as can be covered in one call, THEN 2 instances are spawned with appropriate IP ranges', async () => {
    const result = await service.splitJob('abcd', {
      from: '0.0.0.0',
      to: '0.0.4.100',
      path: '/',
      regex: 'abc'
    });
    result.should.be.deep.equal([
      {
        txId: 'abcd',
        from: '0.0.0.0',
        to: '0.0.3.232',
        path: '/',
        regex: 'abc'
      },
      {
        txId: 'abcd',
        from: '0.0.3.233',
        to: '0.0.4.100',
        path: '/',
        regex: 'abc'
      }
    ]);
  });

  it('WHEN the request covers exactly twice as many IPs as can be covered in one call, THEN 2 instances are spawned with appropriate IP ranges', async () => {
    const result = await service.splitJob('txId', {
      from: '0.0.0.0',
      to: '0.0.7.209',
      path: '/',
      regex: 'abc'
    });
    result.should.be.deep.equal([
      {
        txId: 'txId',
        from: '0.0.0.0',
        to: '0.0.3.232',
        path: '/',
        regex: 'abc'
      },
      {
        txId: 'txId',
        from: '0.0.3.233',
        to: '0.0.7.209',
        path: '/',
        regex: 'abc'
      }
    ]);
  });
});