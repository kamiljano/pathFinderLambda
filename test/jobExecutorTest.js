'use strict';

const rewire = require('rewire');
const chai = require('chai');
chai.use(require('sinon-chai'));
chai.should();
const sinon = require('sinon');

describe('GIVEN JobExecutor', () => {

  let executor;
  let searchService;
  let notificationService;
  let distributionService;
  const transactionId = 'txId';

  beforeEach(() => {
    process.env.MAX_IPS_TO_SCAN_PER_INSTANCE = 10;
    searchService = {
      findPath: sinon.stub().returns(Promise.resolve([]))
    };
    notificationService = {
      notifyAboutMatchingPath: sinon.stub().returns(Promise.resolve())
    };
    distributionService = {
      splitJob: sinon.stub().returns(Promise.resolve(1))
    };

    executor = rewire('../jobExecutor');
    executor.__set__({searchService, notificationService, distributionService});
  });

  const event = (path, from, to, regex, txId = transactionId) => ({
    Records: [
      {
        body: JSON.stringify({
          txId, path, from, to, regex
        })
      }
    ]
  });

  describe('WHEN the job is only for one IP, THEN the job is immediately executed', () => {

    it('AND when there are no successful result, THEN nothing is published', async () => {
      await executor.execute(event('/', '0.0.0.0', '0.0.0.0', 'a'));
      searchService.findPath.should.have.been.calledWith('0.0.0.0', '0.0.0.0', '/', 'a');
      notificationService.notifyAboutMatchingPath.should.not.have.been.called;
    });

    it('AND when there is a successful result, THEN a notification is published', async () => {
      const matchingUrl = 'http://0.0.0.0/';
      searchService.findPath.returns(Promise.resolve([matchingUrl]));
      await executor.execute(event('/', '0.0.0.0', '0.0.0.0', 'a'));
      searchService.findPath.should.have.been.calledWith('0.0.0.0', '0.0.0.0', '/', 'a');
      notificationService.notifyAboutMatchingPath.should.have.been.calledWith(transactionId, '0.0.0.0', '0.0.0.0', '/', 'a', matchingUrl);
    });

  });

  it('WHEN the job is for a small number of IPs, THEN the job is immediately executed', async () => {
    await executor.execute(event('/', '0.0.0.0', '0.0.0.10', 'a'));
    searchService.findPath.should.have.been.calledWith('0.0.0.0', '0.0.0.10', '/', 'a');
    distributionService.splitJob.should.not.have.been.called;
  });

  it('WHEN the job is for a large number of IPs, THEN the job is split', async () => {
    await executor.execute(event('/', '0.0.0.0', '0.0.0.11', 'a'));
    searchService.findPath.should.not.have.been.called;
    distributionService.splitJob.should.have.been.calledWith(transactionId, {
      from: '0.0.0.0',
      to: '0.0.0.11',
      path: '/',
      regex: 'a',
      txId: transactionId
    });
  });
});