'use strict';

const searchService = require('./lib/search/searchService');
const notificationService = require('./lib/notification/notificationService');

const notify = (result, q) => {
  const arr = [];
  for (let url of result) {
    arr.push(notificationService.notifyAboutMatchingPath(q.from, q.to, q.path, q.regex, url));
  }
  return Promise.all(arr);
};

module.exports.find = async (event, context) => {
  // TODO: call recursively in case of large number of IPs to scan
  // TODO: validate request parameters (body schema validation, making sure that 'from' is lower or equal to 'to')
  const b = JSON.parse(event.body);
  try {
    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Received a new request for search from ${b.from} to ${b.to} with path ${b.path} and regex ${b.regex}`
    }));

    const result = await searchService
      .findPath(b.from, b.to, b.path, b.regex);

    for (let url in result) {
      console.log(JSON.stringify({
        txId: event.requestContext.requestId,
        message: `Found a match for URL ${url}`
      }));
    }

    await notify(result, b);

    console.log(JSON.stringify({
      txId: event.requestContext.requestId,
      message: 'Lambda finished execution successfully'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        matchingUrls: result
      }),
    };
  } catch (ex) {
    console.error(JSON.stringify({
      txId: event.requestContext.requestId,
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
