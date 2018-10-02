'use strict';

const searchService = require('./lib/search/searchService');
const notificationService = require('./lib/notification/notificationService');
const distributionService = require('./lib/distribution/distributionService');
const {IP} = require('./lib/search/ip');

const notify = (result, q) => {
  const arr = [];
  for (let url of result) {
    arr.push(notificationService.notifyAboutMatchingPath(q.txId, q.from, q.to, q.path, q.regex, url));
  }
  return Promise.all(arr);
};

const executeJob = async request => {
  console.log(JSON.stringify({
    txId: request.txId,
    message: `Starting the search from ${request.from} to ${request.to}`
  }));

  const result = await searchService.findPath(request.from, request.to, request.path, request.regex);

  for (let url of result) {
    console.log(JSON.stringify({
      txId: request.txId,
      message: `Found a match for URL ${url}`
    }));
  }

  await notify(result, request);
};

const splitJob = async request => {
  const numberOfInstances = await distributionService.splitJob(request.txId, request);

  console.info(JSON.stringify({
    txId: request.txId,
    message: `The request has been split into ${numberOfInstances} jobs for optimization. Listen for the result on the SNS topic`
  }));
};

const requiresSplitting = request => {
  const from = new IP(request.from);
  const to = new IP(request.to);
  return to.diff(from) > process.env.MAX_IPS_TO_SCAN_PER_INSTANCE;
};

module.exports.execute = async event => {

  const request = JSON.parse(event.Records[0].body);

  const start = new Date().getTime();

  try {

    if (requiresSplitting(request)) {
      await splitJob(request);
    } else {
      await executeJob(request);
    }

    console.log(JSON.stringify({
      txId: request.txId,
      message: `Lambda finished execution successfully within ${(new Date().getTime() - start)/1000} seconds`
    }));
  } catch (ex) {
    console.error(JSON.stringify({
      txId: request.txId,
      message: `Lambda execution failed within ${(new Date().getTime() - start)/1000} seconds. Reason: ${ex.stack}`
    }));
    throw ex;
  }

};
