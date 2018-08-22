'use strict';

const searchService = require('./lib/search/searchService');
const notificationService = require('./lib/notification/notificationService');
const {IP} = require('./lib/search/ip');
const distributionService = require('./lib/distribution/distributionService');

const notify = (result, q) => {
  const arr = [];
  for (let url of result) {
    //arr.push(notificationService.notifyAboutMatchingPath(q.from, q.to, q.path, q.regex, url)); //TODO: uncomment
  }
  return Promise.all(arr);
};

const findAndNotify = async (b, txId, start) => {
  const result = await searchService.findPath(b.from, b.to, b.path, b.regex);

  for (let url in result) {
    console.log(JSON.stringify({
      txId,
      message: `Found a match for URL ${url}`
    }));
  }

  await notify(result, b);

  console.log(JSON.stringify({
    txId,
    message: `Lambda finished execution successfully within ${(new Date().getTime() - start)/1000} seconds`
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      matchingUrls: result
    }),
  };
};

const splitJob = (event, b, context) => {
  console.log({
    txId: event.requestContext.requestId,
    message: `Splitting the search request from ${b.from} to ${b.to} into multiple lambda instances`
  });

  distributionService.splitJob(event, b, context);

  return {
    statusCode: 202,
    body: JSON.stringify({
      message: `The request has been split into multiple lambda instances for optimization. Listen for the result on the SNS topic`
    }),
  };
};

module.exports.find = async (event, context) => {
  // TODO: validate request parameters (body schema validation, making sure that 'from' is lower or equal to 'to')
  const start = new Date().getTime();
  const b = JSON.parse(event.body);
  try {
    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Received a new request for search from ${b.from} to ${b.to} with path ${b.path} and regex ${b.regex}`
    }));

    return distributionService.requiresSplitting(b.from, b.to)
      ? splitJob(event, b, context)
      : await findAndNotify(b, event.requestContext.requestId, start);

  } catch (ex) {
    console.error(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Lambda failed after ${(new Date().getTime() - start)/1000} seconds`,
      error: ex.stack
    }));
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An unexpected error occurred'
      }),
    };
  }
};
