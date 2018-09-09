'use strict';

const distributionService = require('./lib/distribution/distributionService');

module.exports.createJob = async event => {
  const start = new Date().getTime();
  try {
    console.info(JSON.stringify({
      txId: event.context.txId,
      message: `Received a new request for search from ${event.from} to ${event.to} with path ${event.path} and regex ${event.regex}`
    }));

    const numberOfInstances = await distributionService.splitJob(event.context.txId, event);

    console.info(JSON.stringify({
      txId: event.context.txId,
      message: `Request processed successfully within ${(new Date().getTime() - start)/1000} milliseconds`
    }));

    return {
      txId: event.context.txId,
      message: `The request has been split into ${numberOfInstances} jobs for optimization. Listen for the result on the SNS topic`
    };

  } catch (ex) {
    console.error(JSON.stringify({
      txId: event.context.txId,
      message: `Lambda failed after ${(new Date().getTime() - start)/1000} seconds`,
      error: ex.stack
    }));
    throw ex;
  }
};